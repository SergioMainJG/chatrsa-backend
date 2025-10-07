import { Router } from "./router.ts";
import { AuthController } from "../controllers/auth/auth.controller.ts";
import { AuthServices } from "../services/auth/auth.service.ts";
import { UserRepositoryImpl } from "../repositories/user/user.repository.impl.ts";
import { UserDatasourceSQLite } from "../datasources/user/user.datasource.sqlite.ts";
import { GetUser } from '../use-cases/user/get-user.use-case.ts';
import { CreateUser } from '../use-cases/user/create-user.use-case.ts';

import { MessageController } from "../controllers/messages/message.controller.ts";
import { MessageService } from "../services/message/message.service.ts";

export class AppRoutes {
  static getRouter(): Router {
    const router = new Router();

    const userDataSource = new UserDatasourceSQLite();
    const userRepository = new UserRepositoryImpl(userDataSource);
    const createUserUseCase = new CreateUser(userRepository);
    const getUserUseCase = new GetUser(userRepository);
    const authService = new AuthServices(createUserUseCase, getUserUseCase);
    const authController = new AuthController(authService);

    const messageService = new MessageService();
    const messageController = new MessageController(messageService);

    router.post("/api/auth/register", authController.register);
    router.post("/api/auth/login", authController.login);

    router.get('/ws', async (req) => {
      console.log("Conexión iniciada");
      if (req.headers.get("upgrade") !== "websocket") {
        return new Response(null, { status: 501 });
      }
      const { socket, response } = Deno.upgradeWebSocket(req);
      await messageController.handleConnection(socket, new URL(req.url));
      return response;
    });

    router.get("/api/health", async (_req) => {
      console.log("health");
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
