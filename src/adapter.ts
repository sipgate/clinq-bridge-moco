import {
  CallDirection,
  CallEvent,
  Channel,
  Config,
  Contact,
  ContactTemplate,
  ContactUpdate,
  ServerError,
} from "@clinq/bridge";
import axios, { AxiosInstance } from "axios";
import * as moment from "moment";
import { COMMENTABLE_TYPE, IComment, ICommentTemplate } from "./models";
import { IMocoContact } from "./models/contact.model";
import {
  anonymizeKey,
  convertToClinqContact,
  convertToMocoContact,
  urlNormalize,
} from "./utils";
import { formatDuration } from "./utils/duration";
import { normalizePhoneNumber, parsePhoneNumber } from "./utils/phone-number";

const FETCH_DELAY = 1000;

enum ENDPOINTS {
  CONTACTS = "contacts/people",
  COMMENTS = "comments",
}

const delay = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const createClient = async (
  { apiKey, apiUrl }: Config,
  endpoint: string = ENDPOINTS.CONTACTS
) => {
  if (typeof apiKey !== "string") {
    throw new Error("Invalid API key.");
  }
  return axios.create({
    baseURL: `${urlNormalize(apiUrl)}/api/v1/${endpoint}`,
    headers: { Authorization: `Token token=${apiKey}` },
  });
};

export const getContacts = async (config: Config): Promise<Contact[]> => {
  const client = await createClient(config);
  return getContactsPage(config.apiKey, client, 1, []);
};

export const createContact = async (
  config: Config,
  contact: ContactTemplate
): Promise<Contact> => {
  const anonKey = anonymizeKey(config.apiKey);

  try {
    const client = await createClient(config);
    const { data: mocoContact } = await client.post<IMocoContact>(
      "",
      convertToMocoContact(contact)
    );
    const convertedContact: Contact = convertToClinqContact(
      mocoContact,
      urlNormalize(config.apiUrl)
    );
    // tslint:disable-next-line:no-console
    console.log(`Created contact for ${anonKey}`);
    return convertedContact;
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.error(
      `Could not create contact for key "${anonKey}: ${error.message}"`
    );
    throw new ServerError(400, "Could not create contact");
  }
};

export const updateContact = async (
  config: Config,
  id: string,
  contact: ContactUpdate
): Promise<Contact> => {
  const anonKey = anonymizeKey(config.apiKey);

  try {
    const client = await createClient(config);
    const { data: mocoContact } = await client.put<IMocoContact>(
      `/${id}`,
      convertToMocoContact(contact, true)
    );
    return convertToClinqContact(mocoContact, urlNormalize(config.apiUrl));
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.error(
      `Could not update contact for key "${anonKey}: ${error.message}"`
    );
    throw new ServerError(400, "Could not update contact");
  }
};

const getContactByPhoneNumber = async (
  config: Config,
  phoneNumber: string
): Promise<Contact> => {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber);
  const contacts = await getContacts(config);
  const possiblePhoneNumberFormats = [
    phoneNumber,
    parsedPhoneNumber.localized,
    normalizePhoneNumber(parsedPhoneNumber.localized),
    parsedPhoneNumber.e164,
    normalizePhoneNumber(parsedPhoneNumber.e164),
  ];
  const result = contacts.find((contact) =>
    contact.phoneNumbers.find((contactPhoneNumber) =>
      possiblePhoneNumberFormats.includes(
        normalizePhoneNumber(contactPhoneNumber.phoneNumber)
      )
    )
  );

  if (!result) {
    // tslint:disable-next-line:no-console
    console.error(`Cannot find contact for phone number ${phoneNumber}`);
  }

  return result;
};

const getContactsPage = async (
  apiKey: string,
  client: AxiosInstance,
  page: number,
  accumulated: Contact[]
): Promise<Contact[]> => {
  const anonKey = anonymizeKey(apiKey);

  const response = await client.get(`?page=${page}`);

  const contacts = response.data.map(convertToClinqContact);
  const mergedContacts = [...accumulated, ...contacts];
  const more = Boolean(
    mergedContacts.length < Number(response.headers["x-total"])
  );

  // tslint:disable-next-line:no-console
  console.log(`Fetched ${mergedContacts.length} contacts for key ${anonKey}`);

  if (more) {
    await delay(FETCH_DELAY);
    return getContactsPage(apiKey, client, ++page, mergedContacts);
  } else {
    return mergedContacts;
  }
};

export const handleCallEvent = async (
  config: Config,
  callEvent: CallEvent
): Promise<void> => {
  const { direction, from, to, channel } = callEvent;
  const anonKey = anonymizeKey(config.apiKey);

  try {
    const client = await createClient(config, ENDPOINTS.COMMENTS);
    const phoneNumber = direction === CallDirection.IN ? from : to;
    const contact: Contact = await getContactByPhoneNumber(config, phoneNumber);

    if (!contact) {
      // tslint:disable-next-line:no-console
      console.error("Could not save CallEvent for", phoneNumber);
      return;
    }

    const comment: ICommentTemplate = parseCallComment(
      contact,
      channel,
      callEvent,
      config.locale
    );
    await createCallComment(client, comment, anonKey);
  } catch (error) {
    throw new ServerError(400, "Could not save CallEvent");
  }
};

export const createCallComment = async (
  client: AxiosInstance,
  comment: ICommentTemplate,
  anonKey: string
): Promise<IComment> => {
  try {
    const mocoComment: IComment = await client.post("", comment);
    // tslint:disable-next-line:no-console
    console.log(`Created call comment for ${anonKey}`);
    return mocoComment;
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.error(
      `Could not create call comment for key "${anonKey}: ${error.message}"`
    );
    throw new ServerError(400, "Could not create call comment");
  }
};

const parseCallComment = (
  contact: Contact,
  channel: Channel,
  { start, end, direction }: CallEvent,
  locale: string
): ICommentTemplate => {
  const date = moment(Number(start));

  const duration = formatDuration(end - start);
  const isGerman = locale === "de_DE";

  const directionInfo =
    direction === CallDirection.IN
      ? isGerman
        ? "Eingehender"
        : "Incoming"
      : isGerman
      ? "Ausgehender"
      : "Outgoing";

  const textEN = `<div><strong>${directionInfo}</strong> CLINQ call in <strong>"${
    channel.name
  }"</strong> on ${date.format("YYYY-MM-DD")} (${duration})<div>`;
  const textDE = `<div><strong>${directionInfo}</strong> CLINQ Anruf in <strong>"${
    channel.name
  }"</strong> am ${date.format("DD.MM.YYYY")} (${duration})<div>`;

  return {
    commentable_id: contact.id,
    commentable_type: COMMENTABLE_TYPE.CONTACT,
    text: isGerman ? textDE : textEN,
  };
};
