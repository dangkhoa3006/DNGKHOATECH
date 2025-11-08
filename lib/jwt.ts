import jwt, { type SignOptions, type JwtPayload as LibJwtPayload, type Secret } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "dev_refresh_secret";

export type JwtPayload = {
  sub: string; // user id
  role: string;
};

export function signAccessToken(payload: JwtPayload, minutes = 15) {
  const opts: SignOptions = {
    expiresIn: minutes * 60,
    issuer: "cms",
    audience: "cms_web",
  };
  return jwt.sign(payload as unknown as LibJwtPayload, ACCESS_TOKEN_SECRET as Secret, opts);
}

export function signRefreshToken(payload: JwtPayload, days = 30) {
  const opts: SignOptions = {
    expiresIn: days * 24 * 60 * 60,
    issuer: "cms",
    audience: "cms_web",
  };
  return jwt.sign(payload as unknown as LibJwtPayload, REFRESH_TOKEN_SECRET as Secret, opts);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET as Secret) as LibJwtPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET as Secret) as LibJwtPayload;
}

