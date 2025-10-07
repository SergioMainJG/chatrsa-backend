import { CreateUserDto } from "../../dtos/create-user.dto.ts";
import { GetUserDto } from "../../dtos/get-user.dto.ts";
import { JsonResponse } from '../../utils/JsonResponse.ts';
import { CustomError } from "../../utils/errors/custom-error.ts";
import { type AuthServices } from "../../services/auth/auth.service.ts";

export class AuthController {
  constructor(
    public readonly authService: AuthServices
  ) { }

  private handleError = (error: unknown): JsonResponse => {
    if (error instanceof CustomError) {
      const code = error.statusCode;
      const message = error.message;
      return new JsonResponse({ error: message }, { status: code });
    }
    return new JsonResponse({ error: `Internal Server Error` }, { status: 500 })
  }

  register = async (req: Request): Promise<JsonResponse> => {
    console.log("register response");
    try {
      const body = await req.json();
      const { isSuccess, error, value } = CreateUserDto.create(body);
      if (!isSuccess) return new JsonResponse({ error }, { status: 400 });
      
      const user = await this.authService.registerUser(value as CreateUserDto);
      return new JsonResponse(user, { status: 201 });
    } catch (error) {
      return this.handleError(error);
    }
  }

  login = async (req: Request): Promise<JsonResponse> => {
    console.log("login response");
    try {
      const body = await req.json();
      const { isSuccess, error, value } = GetUserDto.create(body);
      if (!isSuccess) return new JsonResponse({ error }, { status: 400 });
      
      const user = await this.authService.loginUser(value as GetUserDto);
      return new JsonResponse(user, { status: 200 });
    } catch (error) {
      return this.handleError(error);
    }
  }
}