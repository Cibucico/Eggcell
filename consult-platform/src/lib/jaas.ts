import "server-only";
import { createSign } from "node:crypto";

/**
 * Jitsi as a Service (8x8 JaaS): the video meeting room.
 *
 * Every participant needs a token signed with the account's private key, so
 * only people this site lets in can join a room. Admins and editors join as
 * moderators (they can mute, remove people and end the meeting).
 *
 * Set up: create a free account at jaas.8x8.vc, add an API key, and set
 * JAAS_APP_ID, JAAS_API_KEY_ID and JAAS_PRIVATE_KEY (the PEM text; newlines
 * may be written as \n).
 */

const appId = process.env.JAAS_APP_ID ?? "";
const apiKeyId = process.env.JAAS_API_KEY_ID ?? "";
const privateKey = (process.env.JAAS_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

export const isJaasConfigured = Boolean(appId && apiKeyId && privateKey);
export const jaasDomain = "8x8.vc";
export const jaasScriptUrl = `https://${jaasDomain}/${appId}/external_api.js`;

/** A safe room name, e.g. "inkqubo-finance-basics". The token is limited to it. */
export function roomSlug(...parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

/** Full JaaS room name as the meeting API expects it: "<app id>/<room>". */
export function jaasRoomName(room: string): string {
  return `${appId}/${room}`;
}

const b64url = (input: string | Buffer) => Buffer.from(input).toString("base64url");

export type JaasUser = { id: string; name: string; email: string; moderator: boolean };

/** Signs a participant token, valid for a few hours and for one room. */
export function createJaasToken(
  user: JaasUser,
  room: string,
  options: { hours?: number; keyId?: string; key?: string; app?: string; now?: number } = {},
): string {
  const app = options.app ?? appId;
  const kid = options.keyId ?? apiKeyId;
  const key = options.key ?? privateKey;
  const now = Math.floor((options.now ?? Date.now()) / 1000);
  const header = { alg: "RS256", kid, typ: "JWT" };
  const payload = {
    aud: "jitsi",
    iss: "chat",
    sub: app,
    room,
    iat: now,
    nbf: now - 10,
    exp: now + (options.hours ?? 3) * 3600,
    context: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: "",
        moderator: user.moderator,
        "hidden-from-recorder": false,
      },
      features: {
        livestreaming: false,
        recording: false,
        transcription: false,
        "outbound-call": false,
        "sip-outbound-call": false,
      },
    },
  };
  const body = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const signature = createSign("RSA-SHA256").update(body).sign(key);
  return `${body}.${b64url(signature)}`;
}
