import { JWTAdapter } from '../../config/jwt/jwt.adapter.ts';
import { type MessageService } from '../../services/message/message.service.ts';
import { type MessageRepository } from '../../repositories/message/message.repository.ts';
import { type UserRepository } from '../../repositories/user/user.repository.ts';

export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository,
  ) { }

  public handleConnection = async (socket: WebSocket, url: URL): Promise<void> => {
    try {
      const token = url.searchParams.get('token');
      if (!token) {
        socket.close(1008, 'No token provided');
        return;
      }

      let decodedToken;
      try {
        decodedToken = await JWTAdapter.validateToken<{ id: number }>(token);
      } catch (_error) {
        socket.close(1008, 'Invalid token');
        return;
      }
      const userResult = await this.userRepository.getUserById({ id: decodedToken.id });
      if (!userResult.isSuccess || !userResult.value) {
        socket.close(1008, 'User not found');
        return;
      }

      const user = userResult.value;
      this.messageService.addClient(socket, user.id, user.name);

      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 'connection',
          status: 'connected',
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString()
        }));
      };

      socket.onmessage = async (event) => {
        try {
          await this.handleMessage(socket, event.data);
        } catch (error) {
          this.sendError(socket, 'Invalid message format or server error');
        }
      };

      socket.onclose = () => {
        this.messageService.removeClient(socket);
      };

      socket.onerror = (error) => {
        this.messageService.removeClient(socket);
      };

    } catch (error) {
      try {
        if (socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING) {
          socket.close(1011, 'Internal server error');
        }
      } catch (closeError) {
      }
    }
  }
  private async handleMessage(socket: WebSocket, rawData: string): Promise<void> {
    const clientInfo = this.messageService.getClientInfo(socket);
    if (!clientInfo) {
      return;
    }

    const data = JSON.parse(rawData);
    switch (data.type) {
      case 'get_pending_messages':
        await this.sendPendingMessages(socket, clientInfo.userId);
        break;

      case 'send_message':
        await this.handleSendMessage(socket, data, clientInfo);
        break;

      case 'get_online_users':
        this.sendOnlineUsers(socket);
        break;

      default:
        this.sendError(socket, `Unknown message type: ${data.type}`);
    }
  }
  private async sendPendingMessages(socket: WebSocket, userId: number): Promise<void> {
    try {
      const messagesResult = await this.messageRepository.getMessagesByUserId({ userId });
      if (!messagesResult.isSuccess) {
        this.sendError(socket, 'Failed to retrieve messages');
        return;
      }
      const messages = messagesResult.value || [];
      const enrichedMessages = await Promise.all(
        messages.map(async (msg) => {
          const senderResult = await this.userRepository.getUserById({ id: msg.senderUserId });
          const receiverResult = await this.userRepository.getUserById({ id: msg.receiverUserId });

          return {
            id: msg.id,
            from: senderResult.value?.name || `User_${msg.senderUserId}`,
            to: receiverResult.value?.name || `User_${msg.receiverUserId}`,
            content: msg.content,
            timestamp: new Date().toISOString()
          };
        })
      );

      this.sendMessage(socket, {
        type: 'pending_messages',
        messages: enrichedMessages,
        count: enrichedMessages.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.sendError(socket, 'Internal server error');
    }
  }
  private async handleSendMessage(
    socket: WebSocket,
    data: any,
    senderInfo: { userId: number; userName: string }
  ): Promise<void> {
    try {
      const { to, content } = data;
      if (!to || !content) {
        this.sendError(socket, 'Missing "to" or "content" field');
        return;
      }
      const recipientResult = await this.userRepository.getUserByName({ name: to });
      if (!recipientResult.isSuccess || !recipientResult.value) {
        this.sendError(socket, `User '${to}' not found`);
        return;
      }
      const recipient = recipientResult.value;
      const saveResult = await this.messageRepository.addMessageOfUser({
        senderUserId: senderInfo.userId,
        receiverUserId: recipient.id,
        content: content
      });

      if (!saveResult.isSuccess) {
        this.sendError(socket, 'Failed to save message');
        return;
      }
      const onlineUsers = this.messageService.getOnlineUsers();
      const recipientOnline = onlineUsers.find(u => u.userId === recipient.id);
      if (recipientOnline) {
        let recipientSocket: WebSocket | undefined;
        for (const [sock, info] of (this.messageService as any).clients.entries()) {
          if (info.userId === recipient.id) {
            recipientSocket = sock;
            break;
          }
        }
        if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
          this.sendMessage(recipientSocket, {
            type: 'new_message',
            messageId: saveResult.value?.id,
            from: senderInfo.userName,
            to: recipient.name,
            content: content,
            timestamp: new Date().toISOString()
          });
          this.sendMessage(socket, {
            type: 'ack',
            status: 'delivered',
            messageId: saveResult.value?.id,
            to: recipient.name,
            timestamp: new Date().toISOString()
          });
          return;
        }
      }
      this.sendMessage(socket, {
        type: 'ack',
        status: 'saved',
        messageId: saveResult.value?.id,
        to: recipient.name,
        delivered: false,
        timestamp: new Date().toISOString()
      });


    } catch (_error) {
      this.sendError(socket, 'Failed to send message');
    }
  }
  private sendOnlineUsers(socket: WebSocket): void {
    const onlineUsers = this.messageService.getOnlineUsers();
    this.sendMessage(socket, {
      type: 'online_users',
      users: onlineUsers.map(u => u.userName),
      count: onlineUsers.length,
      timestamp: new Date().toISOString()
    });
  }
  private sendError(socket: WebSocket, message: string): void {
    this.sendMessage(socket, {
      type: 'error',
      error: message,
      timestamp: new Date().toISOString()
    });
  }
  private sendMessage(socket: WebSocket, data: any): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }
}