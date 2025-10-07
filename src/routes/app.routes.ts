import { Router } from "./router.ts";

import { AuthController } from "../controllers/auth/auth.controller.ts";
import { MessageController } from "../controllers/messages/message.controller.ts";

import { AuthServices } from "../services/auth/auth.service.ts";
import { MessageService } from "../services/message/message.service.ts";

import { UserRepositoryImpl } from "../repositories/user/user.repository.impl.ts";
import { MessageRepositoryImpl } from "../repositories/message/message.repository.impl.ts";

import { UserDatasourceSQLite } from "../datasources/user/user.datasource.sqlite.ts";
import { UserDatasourceKV } from '../datasources/user/user.datasource.kv.ts';
import { MessageDatasourceSQLite } from "../datasources/message/message.datasource.sqlite.ts";
import { MessageDatasourceKV } from '../datasources/message/message.datasource.kv.ts';

import { CreateUser } from '../use-cases/user/create-user.use-case.ts';
import { GetUser } from '../use-cases/user/get-user.use-case.ts';
import { GetMessage } from '../use-cases/messages/get-messages.use-case.ts';


export class AppRoutes {
  static getRouter(): Router {
    const router = new Router();

    const userDatasourceSQLite = new UserDatasourceSQLite();
    const userDatasourceKV = new UserDatasourceKV();

    const userRepositorySQLite = new UserRepositoryImpl(userDatasourceSQLite);
    const userRepositoryKV = new UserRepositoryImpl(userDatasourceKV);

    const userRepositories = [userRepositorySQLite, userRepositoryKV];

    const messageDatasourceSQLite = new MessageDatasourceSQLite();
    const messageDatasourceKV = new MessageDatasourceKV();

    const messageRepositorySQLite = new MessageRepositoryImpl(messageDatasourceSQLite);
    const messageRepositoryKV = new MessageRepositoryImpl(messageDatasourceKV);

    const messageRepositories = [messageRepositorySQLite, messageRepositoryKV];

    const createUserUseCase = new CreateUser(userRepositories);
    const getUserUseCase = new GetUser(userRepositories);
    const getMessageUseCase = new GetMessage(messageRepositories);


    const authService = new AuthServices(createUserUseCase, getUserUseCase, getMessageUseCase);
    const messageService = new MessageService();

    const authController = new AuthController(authService);
    const messageController = new MessageController(messageService, messageRepositorySQLite, userRepositorySQLite);

    router.post("/api/auth/register", authController.register);
    router.post("/api/auth/login", authController.login);

    router.get("/api/health", async (_req) => {
      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          onlineUsers: messageService.getOnlineUsers(),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    });
    router.websocket('/ws', async (req) => {
      if (req.headers.get("upgrade") !== "websocket") {
        return new Response("Not a websocket request", { status: 400 });
      }
      const { socket, response } = Deno.upgradeWebSocket(req);

      messageController.handleConnection(socket, new URL(req.url));

      return response;
    });

    return router;
  }
}