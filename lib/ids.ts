import crypto from "node:crypto";

export function newId(prefix = "") {
  return `${prefix}${crypto.randomUUID()}`;
}
