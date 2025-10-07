import {
  create,
  verify,
  getNumericDate,
} from "@zaubrik/djwt";
import GLOBAL_CONFIG from '../env/get.env.ts';
import { CustomError } from "../../utils/errors/custom-error.ts";

const JWT_SEED = GLOBAL_CONFIG.jwtSeed;
const getKey = async (seed: string): Promise<CryptoKey> => {
  const keyBuf = new TextEncoder().encode(seed);
  return await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );
};
const keyPromise = getKey(JWT_SEED);

export class JWTAdapter {
  static async generateToken(payload: any, duration: number = 24) {
    try {
      const key = await keyPromise;
      const token = await create(
        { alg: "HS512", typ: "JWT" }, 
        { ...payload, exp: getNumericDate(duration * 3600) },
        key
      );
      return token;
    } catch (error) {
      throw CustomError.internalServer('Failed to generate token');
    }
  }

  static async validateToken<T>(token: string): Promise<T> {
    try {
      const key = await keyPromise;
      const payload = await verify(token, key);
      return payload as T;
    } catch (error) {
      throw CustomError.unauthorized('Invalid or expired token');
    }
  }
}