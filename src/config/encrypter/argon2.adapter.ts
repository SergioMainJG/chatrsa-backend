import * as argon2 from 'argon2';

export class Encrypter {
  public static hash = async (password: string) => await argon2.hash(password);

  public static compare = async (hashed: string, password: string) => await argon2.verify(hashed, password);
}