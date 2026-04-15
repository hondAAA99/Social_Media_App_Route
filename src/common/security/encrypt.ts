import crypto from "crypto";
import {
  CIPHER_IV_SIZE,
  ENCRYPTION_ALGORITM,
  ENCRYPTION_KEY,
} from "../../config/config.services.js";

export function Globalencrypt({ plainText }: { plainText: string }) {
  const Cipheriv = crypto.randomBytes(CIPHER_IV_SIZE);
  const Cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITM,
    ENCRYPTION_KEY,
    Cipheriv,
  );
  let CipherText = Cipher.update(plainText, "utf-8", "hex");
  CipherText += Cipher.final("hex");
  return Cipheriv + ":" + CipherText;
}

export function Globaldecrypt({ cipherText }: { cipherText: string }) {
  const [hexIv, cipher] = cipherText.split(":");

  const Cipheriv = Buffer.from(hexIv!, "hex");
  const Cipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITM,
    ENCRYPTION_KEY,
    Cipheriv,
  );
  let plainText = Cipher.update(cipher!, "hex", "utf-8");
  plainText += Cipher.final("hex");
  return plainText;
}
