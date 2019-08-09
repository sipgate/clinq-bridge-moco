import { Adapter, start } from "@clinq/bridge";
import {
  createContact,
  getContacts,
  updateContact,
  handleCallEvent
} from "./adapter";

const adapter: Adapter = {
  createContact,
  getContacts,
  updateContact,
  handleCallEvent
};

start(adapter);
