import axios, { AxiosInstance } from "axios";

import {
  Config,
  Contact,
  ContactTemplate,
  ContactUpdate,
  ServerError
} from "@clinq/bridge";

import {
  anonymizeKey,
  convertToClinqContact,
  convertToMocoContact
} from "./utils";

export const createClient = async (apiKey: string, apiUrl: string) => {
  if (typeof apiKey !== "string") {
    throw new Error("Invalid API key.");
  }
  return axios.create({
    baseURL: `${apiUrl}/api/v1/contacts/people`,
    headers: { Authorization: `Token token=${apiKey}` }
  });
};

export const getContacts = async ({ apiKey, apiUrl }: Config) => {
  const client = await createClient(apiKey, apiUrl);
  return getContactsPage(apiKey, client, 0, []);
};

export const createContact = async (
  { apiKey, apiUrl }: Config,
  contact: ContactTemplate
): Promise<Contact> => {
  const anonKey = anonymizeKey(apiKey);

  try {
    const client = await createClient(apiKey, apiUrl);
    const mocoContact = await client.post("", convertToMocoContact(contact));
    const convertedContact: Contact = convertToClinqContact(mocoContact);
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
  { apiKey, apiUrl }: Config,
  id: string,
  contact: ContactUpdate
): Promise<Contact> => {
  const anonKey = anonymizeKey(apiKey);

  try {
    const client = await createClient(apiKey, apiUrl);
    const response = await client.put(`/${id}`, convertToMocoContact(contact));
    const mocoContact = response.data;
    return convertToClinqContact(mocoContact);
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.error(
      `Could not update contact for key "${anonKey}: ${error.message}"`
    );
    throw new ServerError(400, "Could not update contact");
  }
};

const getContactsPage = async (
  apiKey: string,
  client: AxiosInstance,
  page: number,
  accumulated: Contact[]
): Promise<Contact[]> => {
  const anonKey = anonymizeKey(apiKey);

  const response = await client.get("");

  const contacts = response.data.map(convertToClinqContact);
  const mergedContacts = [...accumulated, ...contacts];
  const more = Boolean(
    mergedContacts.length < Number(response.headers["x-total"])
  );

  // tslint:disable-next-line:no-console
  console.log(`Fetched ${mergedContacts.length} contacts for key ${anonKey}`);

  if (more) {
    return getContactsPage(apiKey, client, ++page, mergedContacts);
  } else {
    return mergedContacts;
  }
};
