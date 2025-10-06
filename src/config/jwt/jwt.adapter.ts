import jwt, { SignOptions } from 'jsonwebtoken';
import GLOBAL_CONFIG from '../env/get.env.ts';

const JWT_SEED = GLOBAL_CONFIG.jwtSeed;

export class JWTAdapter {
  static generateToken(payload: any, duration: string = '1h') {
    return new Promise((resolve) => {
      jwt.sign(payload, JWT_SEED, { expiresIn: duration } as SignOptions, (err, token) => {
        return err
          ? resolve(null)
          : resolve(token);
      });
    });
  }
  static validateToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, JWT_SEED, (err, decoded) => {
        return err
          ? resolve(null)
          : resolve(decoded as T);
      });
    });
  }
}