"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bridge_1 = require("@clinq/bridge");
const adapter_1 = require("./adapter");
const adapter = {
    createContact: adapter_1.createContact,
    getContacts: adapter_1.getContacts,
    updateContact: adapter_1.updateContact
};
bridge_1.start(adapter);
//# sourceMappingURL=index.js.map