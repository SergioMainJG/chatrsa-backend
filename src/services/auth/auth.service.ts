import { CreateUserDto } from "../../dtos/create-user.dto.ts";
import { GetUserDto } from "../../dtos/get-user.dto.ts";
import { CustomError } from "../../utils/errors/custom-error.ts";
import { JWTAdapter } from "../../config/jwt/jwt.adapter.ts";
import { CreateUserUseCase } from '../../use-cases/user/create-user.use-case.ts';
import { GetUserUseCase } from "../../use-cases/user/get-user.use-case.ts";
import { GetMessageUseCase } from "../../use-cases/messages/get-messages.use-case.ts";

export class AuthServices {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUserUseCase: GetUserUseCase,
    private getMessageService: GetMessageUseCase
  ) {
    
  }
  public async registerUser(createUserDto: CreateUserDto) {
    const { isSuccess, error, value } = await this.createUserUseCase.execute(createUserDto);
    if (!isSuccess) throw error;
    const token = await JWTAdapter.generateToken({ id: value?.id });
    if (!token) throw CustomError.internalServer(`There's an error in the cration of JWT`);
    return {
      user: value,
      token: token,
    }
  }
  public async loginUser(getUserDto: GetUserDto) {
    const { isSuccess, error, value } = await this.getUserUseCase.execute(getUserDto);
    if(!isSuccess) throw error;
    const token = await JWTAdapter.generateToken({id: value?.id});
    if(!token) throw CustomError.internalServer(`There's an error in the cration of JWT`);
    const messages = (await this.getMessageService.execute({userId: value!.id})).value || []
    return {
      user: value,
      token: token,
      messages: messages
    }
  }
}