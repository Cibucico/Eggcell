import "server-only";
import { createHmac } from "node:crypto";
import { checkSaId, normaliseSaId } from "@/lib/sa-id";

/**
 * Turns an ID number into a keyed hash. The hash lets the site refuse a
 * second account for the same ID without ever storing the ID number.
 */
export function hashIdNumber(idNumber: string): string {
  const secret = process.env.ID_HASH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ID_HASH_SECRET is not set (at least 32 characters)");
  }
  return createHmac("sha256", secret).update(normaliseSaId(idNumber)).digest("hex");
}

export const ID_MESSAGES = {
  format: "Enter your 13-digit South African ID number.",
  date: "This ID number does not contain a valid date of birth. Please check it.",
  checksum: "This ID number is not valid. Please check each digit.",
  male: "Membership is for women, and this ID number is registered as male. If this is a mistake, please contact us.",
  taken: "An account already exists for this ID number. Sign in instead, or contact us for help.",
  unavailable: "We could not check your ID number right now. Please try again later.",
} as const;

/** Validates the number and returns an error message, or null when it is a valid female ID. */
export function idNumberError(idNumber: string): string | null {
  const result = checkSaId(idNumber);
  if (!result.ok) return ID_MESSAGES[result.reason];
  if (!result.female) return ID_MESSAGES.male;
  return null;
}
