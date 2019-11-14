import {
  Contact,
  ContactTemplate,
  PhoneNumber,
  PhoneNumberLabel
} from "@clinq/bridge";
import {
  IMocoContact,
  IMocoContactTemplate,
  MocoGender
} from "../models/contact.model";

export const convertToMocoContact = ({
  firstName: firstname,
  lastName: lastname,
  phoneNumbers,
  email
}: Contact | ContactTemplate): IMocoContactTemplate => {
  const workPhone = phoneNumbers.filter(
    phoneNumber => phoneNumber.label === PhoneNumberLabel.WORK
  );
  const mobilePhone = phoneNumbers.filter(
    phoneNumber => phoneNumber.label === PhoneNumberLabel.MOBILE
  );

  return {
    gender: MocoGender.UNKNOWN,
    firstname: firstname ? firstname : "",
    lastname: lastname ? lastname : "",
    work_email: email ? email : "",
    work_phone: workPhone.length ? workPhone[0].phoneNumber : "",
    mobile_phone: mobilePhone.length ? mobilePhone[0].phoneNumber : ""
  };
};

export const convertToClinqContact = (
  contact: IMocoContact,
  apiUrl: string
): Contact => {
  const phoneNumbers: PhoneNumber[] = [];

  if (contact.work_phone && contact.work_phone !== "") {
    phoneNumbers.push({
      label: PhoneNumberLabel.WORK,
      phoneNumber: contact.work_phone
    });
  }

  if (contact.mobile_phone && contact.mobile_phone !== "") {
    phoneNumbers.push({
      label: PhoneNumberLabel.MOBILE,
      phoneNumber: contact.mobile_phone
    });
  }

  const contactId = String(contact.id);

  return {
    id: contactId,
    avatarUrl: contact.avatar_url ? contact.avatar_url : null,
    contactUrl: `${apiUrl}/contacts/people/${contactId}`,
    name: null,
    firstName: contact.firstname ? contact.firstname : null,
    lastName: contact.lastname ? contact.lastname : null,
    email: contact.work_email ? contact.work_email : null,
    organization:
      contact.company && contact.company.name ? contact.company.name : null,
    phoneNumbers
  };
};
