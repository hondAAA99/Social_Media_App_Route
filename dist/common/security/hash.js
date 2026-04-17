import { compareSync, hashSync } from "bcrypt";
import { HASH_SALT } from "../../config/config.services.js";
export function Globalhash({ plainText }) {
    return hashSync(plainText, HASH_SALT);
}
export function GlobalCompare({ plainText, hashText, }) {
    return compareSync(plainText, hashText);
}
