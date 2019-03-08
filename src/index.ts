import { Adapter, start } from "@clinq/bridge";
import { createContact, getContacts, updateContact } from "./adapter";

const adapter: Adapter = {
  createContact,
  getContacts,
  updateContact
};

start(adapter);
