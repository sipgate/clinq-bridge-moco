"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const bridge_1 = require("@clinq/bridge");
const utils_1 = require("./utils");
exports.createClient = (apiKey, apiDomain) => __awaiter(this, void 0, void 0, function* () {
    if (typeof apiKey !== "string") {
        throw new Error("Invalid API key.");
    }
    return axios_1.default.create({
        baseURL: `https://${apiDomain}/api/3`,
        headers: { "Authorization: Token token": apiKey }
    });
});
exports.getContacts = ({ apiKey, apiUrl }) => __awaiter(this, void 0, void 0, function* () {
    const client = yield exports.createClient(apiKey, apiUrl);
    return getContactsPage(apiKey, client, 0, []);
});
exports.createContact = ({ apiKey, apiUrl }, contact) => __awaiter(this, void 0, void 0, function* () {
    const anonKey = utils_1.anonymizeKey(apiKey);
    try {
        const client = yield exports.createClient(apiKey, apiUrl);
        const mocoContact = yield client.post("", utils_1.convertToMocoContact(contact));
        const convertedContact = utils_1.convertToClinqContact(mocoContact);
        console.log(`Created contact for ${anonKey}`);
        return convertedContact;
    }
    catch (error) {
        console.error(`Could not create contact for key "${anonKey}: ${error.message}"`);
        throw new bridge_1.ServerError(400, "Could not create contact");
    }
});
exports.updateContact = ({ apiKey, apiUrl }, id, contact) => __awaiter(this, void 0, void 0, function* () {
    const anonKey = utils_1.anonymizeKey(apiKey);
    try {
        const client = yield exports.createClient(apiKey, apiUrl);
        yield client.put(id, utils_1.convertToMocoContact(contact));
        const mocoContact = yield client.get(id);
        return utils_1.convertToClinqContact(mocoContact);
    }
    catch (error) {
        console.error(`Could not update contact for key "${anonKey}: ${error.message}"`);
        throw new bridge_1.ServerError(400, "Could not update contact");
    }
});
const getContactsPage = (apiKey, client, page, accumulated) => __awaiter(this, void 0, void 0, function* () {
    const anonKey = utils_1.anonymizeKey(apiKey);
    const response = yield client.get("/contacts/people");
    const contacts = response.data.map(utils_1.convertToClinqContact);
    const mergedContacts = [...accumulated, ...contacts];
    const more = Boolean(mergedContacts.length < Number(response.headers["x-total"]));
    console.log(`Fetched ${mergedContacts.length} contacts for key ${anonKey}`);
    if (more) {
        return getContactsPage(apiKey, client, ++page, mergedContacts);
    }
    else {
        return mergedContacts;
    }
});
//# sourceMappingURL=adapter.js.map