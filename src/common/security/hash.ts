import { compareSync, hashSync } from "bcrypt";
import { HASH_SALT } from "../../config/config.services.js";

export function Globalhash({ plainText }: { plainText: string }) {
  return hashSync(plainText, HASH_SALT);
}

export function GlobalCompare({
  plainText,
  hashText,
}: {
  plainText: string;
  hashText: string;
}) {
  return compareSync(plainText, hashText);
}
