import { JWTAdapter } from '../../config/jwt/jwt.adapter.ts';
import { type MessageService } from '../../services/message/message.service.ts';
import { type MessageRepository } from '../../repositories/message/message.repository.ts';
import { type UserRepository } from '../../repositories/user/user.repository.ts';

export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository
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
        socket.close(1008, 'Invalid or expired token');
        return;
      }
      const userId = decodedToken.id;
      const userResult = await this.userRepository.getUserById({ id: userId });
      if (!userResult.isSuccess || !userResult.value) {
        socket.close(1008, 'User not found');
        return;
      }
      const userName = userResult.value.name;
      this.messageService.addClient(socket, userId, userName);
      socket.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        userId: userId,
        userName: userName,
        timestamp: new Date().toISOString()
      }));
      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'message':
              await this.messageService.sendPrivateMessage(socket, event.data);
              break;
            case 'get_pending_messages':
              await this.sendPendingMessages(socket, userId, userName);
              break;
            case 'get_online_users':
              this.sendOnlineUsers(socket);
              break;
            default:
              await this.messageService.sendPrivateMessage(socket, event.data);
          }
        } catch (error) {
          socket.send(JSON.stringify({
            type: 'error',
            error: 'Failed to process message',
            details: error.message,
            timestamp: new Date().toISOString()
          }));
        }
      };
      socket.onclose = () => {
        this.messageService.removeClient(socket);
      };
      socket.onerror = (_error) => {
        this.messageService.removeClient(socket);
      };
    } catch (_error) {
      try {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close(1011, 'Internal server error');
        }
      } catch (_closeError) {
        //Catch, but there's nothing to do, just add a log
      }
    }
  }
  private async sendPendingMessages(socket: WebSocket, userId: number, userName: string): Promise<void> {
    try {
      const messagesResult = await this.messageRepository.getMessagesForUser({
        recipientId: userId
      });
      if (!messagesResult.isSuccess) {
        socket.send(JSON.stringify({
          type: 'error',
          error: 'Failed to retrieve messages',
          timestamp: new Date().toISOString()
        }));
        return;
      }
      const messages = messagesResult.value || [];
      const processedMessages = await Promise.all(
        messages.map(async (msg) => {
          try {
            const parsedContent = JSON.parse(msg.content);
            const senderResult = await this.userRepository.getUserById({ id: msg.owner });
            const senderName = senderResult.isSuccess && senderResult.value 
              ? senderResult.value.name 
              : `User_${msg.owner}`;
            return {
              id: msg.id,
              from: senderName, 
              to: userName,       
              content: parsedContent.content, 
              timestamp: parsedContent.timestamp
            };
          } catch (_error) {
            return {
              id: msg.id,
              from: `User_${msg.owner}`,
              content: msg.content,
              timestamp: new Date().toISOString()
            };
          }
        })
      );
      socket.send(JSON.stringify({
        type: 'pending_messages',
        messages: processedMessages,
        count: processedMessages.length,
        timestamp: new Date().toISOString()
      }));

    } catch (_error) {
      socket.send(JSON.stringify({
        type: 'error',
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }));
    }
  }
  private sendOnlineUsers(socket: WebSocket): void {
    try {
      const onlineUsers = this.messageService.getOnlineUsers();
      
      socket.send(JSON.stringify({
        type: 'online_users',
        users: onlineUsers,
        count: onlineUsers.length,
        timestamp: new Date().toISOString()
      }));
    } catch (_error) {
      socket.send(JSON.stringify({
        type: 'error',
        error: 'Failed to get online users',
        timestamp: new Date().toISOString()
      }));
    }
  }
}