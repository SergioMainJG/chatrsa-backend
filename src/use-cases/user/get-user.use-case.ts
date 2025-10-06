import { Encrypter } from "../../config/encrypter/argon2.adapter.ts";
import { GetUserDto } from "../../dtos/get-user.dto.ts";
import { User } from "../../models/user.ts";
import { UserRepository } from "../../repositories/user/user.repository.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";
import { CustomError } from "../../utils/errors/custom-error.ts";

export interface GetUserUseCase {
  execute(getUserDto: GetUserDto): Promise<Result<User, Error>>
}

export class GetUser implements GetUserUseCase {

  constructor(
    private readonly repository: UserRepository
  ) { }

  async execute(getUserDto: GetUserDto): Promise<Result<User, Error>> {
    // Buscar usuario por nombre
    const { isSuccess, error, value } = await this.repository.getUserByName({ name: getUserDto.name });
    if (!isSuccess) {
      return Result.Failure(CustomError.unauthorized(`Invalid credentials`));
    }
    
    // Verificar contraseña (hash primero, contraseña plana después)
    const arePasswordsEquals = await Encrypter.compare(value?.password as string, getUserDto.password);
    if (!arePasswordsEquals) {
      return Result.Failure(CustomError.unauthorized(`Invalid credentials`));
    }

    return Result.Success(value as User);
  }
}