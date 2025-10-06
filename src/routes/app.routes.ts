import { Router } from "./router.ts";
import { AuthController } from "../controllers/auth/auth.controller.ts";
import { AuthServices } from "../services/auth/auth.service.ts";
import { UserRepositoryImpl } from "../repositories/user/user.repository.impl.ts";
import { UserDatasourceSQLite } from "../datasources/user/user.datasource.sqlite.ts";
import { GetUser } from '../use-cases/user/get-user.use-case.ts';
import { CreateUser } from '../use-cases/user/create-user.use-case.ts';

export class AppRoutes {
  static getRouter(): Router {
    const router = new Router();

    const userDataSource = new UserDatasourceSQLite();
    const userRepository = new UserRepositoryImpl(userDataSource);
    const createUserUseCase = new CreateUser(userRepository);
    const getUserUseCase = new GetUser(userRepository);
    const authService = new AuthServices(createUserUseCase, getUserUseCase);
    const authController = new AuthController(authService);

    router.post("/api/auth/register", authController.register);
    router.post("/api/auth/login", authController.login);

    router.get("/api/health", async (_req) => {
      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    });

    return router;
  }
}
