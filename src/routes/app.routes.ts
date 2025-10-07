import { Router } from "./router.ts";
import { AuthController } from "../controllers/auth/auth.controller.ts";
import { AuthServices } from "../services/auth/auth.service.ts";
import { UserRepositoryImpl } from "../repositories/user/user.repository.impl.ts";
import { UserDatasourceSQLite } from "../datasources/user/user.datasource.sqlite.ts";
import { GetUser } from '../use-cases/user/get-user.use-case.ts';
import { CreateUser } from '../use-cases/user/create-user.use-case.ts';

import { MessageController } from "../controllers/messages/message.controller.ts";
import { MessageService } from "../services/message/message.service.ts";
import { MessageRepositoryImpl } from "../repositories/message/message.repository.impl.ts";
import { MessageDatasourceSQLite } from "../datasources/message/message.datasource.sqlite.ts";

export class AppRoutes {
  static getRouter(): Router {
    const router = new Router();
    const userDataSource = new UserDatasourceSQLite();
    const userRepository = new UserRepositoryImpl(userDataSource);
    const createUserUseCase = new CreateUser(userRepository);
    const getUserUseCase = new GetUser(userRepository);
    const authService = new AuthServices(createUserUseCase, getUserUseCase);
    const authController = new AuthController(authService);
    const messageDataSource = new MessageDatasourceSQLite();
    const messageRepository = new MessageRepositoryImpl(messageDataSource);
    const messageService = new MessageService(messageRepository, userRepository);
    const messageController = new MessageController(messageService, messageRepository, userRepository);

    router.post("/api/auth/register", authController.register);
    router.post("/api/auth/login", authController.login);
    router.get("/api/health", async (_req) => {
      console.log("✅ Health check");
      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          connectedClients: messageService.getConnectedClientsCount(),
          onlineUsers: messageService.getOnlineUsers()
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    });
    router.websocket('/ws', (req) => {
      console.log("WebSocket connection request");
      try {
        const upgrade = req.headers.get("upgrade");
        if (upgrade !== "websocket") {
          console.log("Not a websocket upgrade request");
          return new Response("Expected websocket", { status: 400 });
        }
        const { socket, response } = Deno.upgradeWebSocket(req);
        const url = new URL(req.url);
        messageController.handleConnection(socket, url).catch((error) => {
          console.error("Error in handleConnection:", error);
        });
        return response;
      } catch (error) {
        console.error("Error in WebSocket handler:", error);
        return new Response("Internal Server Error", { status: 500 });
      }
    });
    return router;
  }
}