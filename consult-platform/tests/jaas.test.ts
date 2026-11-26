import { createVerify, generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createJaasToken } from "@/lib/jaas";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

const decode = (part: string) => JSON.parse(Buffer.from(part, "base64url").toString("utf8"));

describe("createJaasToken", () => {
  const token = createJaasToken(
    { id: "u1", name: "Naledi", email: "n@example.test", moderator: false },
    "inkqubo-clinic",
    { app: "vpaas-magic-cookie-abc", keyId: "vpaas-magic-cookie-abc/key1", key: pem, now: 1_800_000_000_000, hours: 2 },
  );
  const [h, p, sig] = token.split(".");

  it("is signed with the private key (RS256)", () => {
    const ok = createVerify("RSA-SHA256").update(`${h}.${p}`).verify(publicKey, Buffer.from(sig, "base64url"));
    expect(ok).toBe(true);
    expect(decode(h)).toEqual({ alg: "RS256", kid: "vpaas-magic-cookie-abc/key1", typ: "JWT" });
  });

  it("limits the token to one room, this app and a few hours", () => {
    const payload = decode(p);
    expect(payload).toMatchObject({ aud: "jitsi", iss: "chat", sub: "vpaas-magic-cookie-abc", room: "inkqubo-clinic" });
    expect(payload.exp - payload.iat).toBe(2 * 3600);
  });

  it("carries the person and whether she moderates", () => {
    expect(decode(p).context.user).toMatchObject({ name: "Naledi", moderator: false });
    const mod = createJaasToken(
      { id: "a1", name: "Admin", email: "a@example.test", moderator: true },
      "x",
      { app: "a", keyId: "a/k", key: pem },
    );
    expect(decode(mod.split(".")[1]).context.user.moderator).toBe(true);
  });

  it("switches off paid features", () => {
    expect(decode(p).context.features).toMatchObject({ recording: false, livestreaming: false });
  });
});
