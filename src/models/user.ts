interface UserProps {
  id: number;
  name: string;
  password: string;
}

export class User {

  public static create({ id, name, password }: UserProps): User {
    return new User(id, name, password);
  }

  private constructor(
    private readonly _id: number,
    private readonly _name: string,
    private readonly _password: string
  ) { }
  
  get id() { return this._id }
  get name() { return this._name; }
  get password() { return this._password }
}

