"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bridge_1 = require("@clinq/bridge");
exports.convertToMocoContact = ({ firstName: firstname, lastName: lastname, phoneNumbers }) => {
    const work_phone = phoneNumbers.filter(phoneNumber => phoneNumber.label === bridge_1.PhoneNumberLabel.WORK);
    const mobile_phone = phoneNumbers.filter(phoneNumber => phoneNumber.label === bridge_1.PhoneNumberLabel.MOBILE);
    return {
        gender: "U",
        firstname,
        lastname,
        mobile_phone,
        work_phone
    };
};
exports.convertToClinqContact = (contact) => {
    const phoneNumbers = [];
    if (contact.work_phone) {
        phoneNumbers.push({
            label: bridge_1.PhoneNumberLabel.WORK,
            phoneNumber: contact.work_phone
        });
    }
    if (contact.mobile_phone) {
        phoneNumbers.push({
            label: bridge_1.PhoneNumberLabel.MOBILE,
            phoneNumber: contact.mobile_phone
        });
    }
    return {
        id: String(contact.id),
        avatarUrl: contact.avatar_url,
        contactUrl: null,
        name: null,
        firstName: contact.firstname || null,
        lastName: contact.lastname || null,
        email: contact.work_email || null,
        organization: contact.company.name || null,
        phoneNumbers
    };
};
//# sourceMappingURL=mapper.js.map