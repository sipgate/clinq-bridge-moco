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
  let contact = {
    gender: "U",
    firstname,
    lastname
  };

  const work_phone = phoneNumbers.filter(
    phoneNumber => phoneNumber.label === PhoneNumberLabel.WORK
  );
  const mobile_phone = phoneNumbers.filter(
    phoneNumber => phoneNumber.label === PhoneNumberLabel.MOBILE
  );

  if (work_phone[0]) {
    contact["work_phone"] = work_phone[0].phoneNumber;
  }
  if (mobile_phone[0]) {
    contact["mobile_phone"] = mobile_phone[0].phoneNumber;
  }

  return contact;
};

export const convertToClinqContact = (contact: any) => {
  const phoneNumbers: PhoneNumber[] = [];

  if (contact.work_phone) {
    phoneNumbers.push({
      label: PhoneNumberLabel.WORK,
      phoneNumber: contact.work_phone
    });
  }

  if (contact.mobile_phone) {
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
