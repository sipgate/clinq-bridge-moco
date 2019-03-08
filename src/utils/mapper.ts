import {
  Contact,
  ContactTemplate,
  PhoneNumber,
  PhoneNumberLabel
} from "@clinq/bridge";

export const convertToMocoContact = ({
  firstName: firstname,
  lastName: lastname,
  phoneNumbers
}: Contact | ContactTemplate) => {

  const workPhone = phoneNumbers.filter(
    phoneNumber => phoneNumber.label === PhoneNumberLabel.WORK
  );
  const mobilePhone = phoneNumbers.filter(
    phoneNumber => phoneNumber.label === PhoneNumberLabel.MOBILE
  );

  return {
    gender: "U",
    firstname,
    lastname,
    work_phone: workPhone.length ? workPhone[0].phoneNumber : "",
    mobile_phone: mobilePhone.length ? mobilePhone[0].phoneNumber : ""
  };
};

export const convertToClinqContact = (contact: any) => {
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

  return {
    id: String(contact.id),
    avatarUrl: contact.avatar_url,
    contactUrl: null,
    name: null,
    firstName: contact.firstname ? contact.firstname : null,
    lastName: contact.lastname ? contact.lastname : null,
    email: contact.work_email ? contact.work_email : null,
    organization:
      contact.company && contact.company.name ? contact.company.name : null,
    phoneNumbers
  };
};
