interface UserProps{
  id: string;
  name: string;
  password: string;
}

export class User {
  public static create({id, name, password}: UserProps): User{
    return new User(id, name, password);
  }

  private constructor(
    private _name: string,
    private _id: string,
    private _password: string
  ) { }

  set name( name: string )  {
    if( name.trim().length === 0){return;}
    this._name = name;
  }

  get name(){
    return this._name;
  }

}

