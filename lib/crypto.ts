import { randomBytes, pbkdf2Sync, timingSafeEqual, createHash } from "crypto";

const PBKDF2_ITERATIONS = Number(process.env.PBKDF2_ITERATIONS || 120000);
const PBKDF2_KEYLEN = 64; // 64 bytes = 512 bits, dùng SHA-256 cho đúng yêu cầu "hash 256"
const PBKDF2_DIGEST = "sha256";

export function generateSalt(length = 16) {
  return randomBytes(length).toString("hex");
}

export function hashPassword(password: string, salt?: string) {
  const s = salt ?? generateSalt();
  const derived = pbkdf2Sync(password, s, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST);
  const hash = derived.toString("hex");
  // Lưu theo format: pbkdf2$iter$salt$hash
  return `pbkdf2$${PBKDF2_ITERATIONS}$${s}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, itersStr, salt, hashHex] = stored.split("$");
  if (scheme !== "pbkdf2") return false;
  const iters = Number(itersStr);
  const derived = pbkdf2Sync(password, salt, iters, PBKDF2_KEYLEN, PBKDF2_DIGEST);
  const given = Buffer.from(hashHex, "hex");
  return timingSafeEqual(given, derived);
}

export function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

