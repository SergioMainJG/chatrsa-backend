import { type MessageRepository } from "../../repositories/message/message.repository.ts";
import { type UserRepository } from "../../repositories/user/user.repository.ts";
import { CreateMessageDto } from "../../dtos/create-message.dto.ts";

interface ClientInfo {
  socket: WebSocket;
  userId: number;
  userName: string;
  connectedAt: Date;
}

interface PrivateMessage {
  to: string;
  from?: string;
  content: string;
  timestamp?: string;
}

export class MessageService {
  private clientsByUserId = new Map<number, ClientInfo>();
  private userIdByName = new Map<string, number>();
  private userIdBySocket = new Map<WebSocket, number>();
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository
  ) { }
  public addClient(socket: WebSocket, userId: number, userName: string): void {
    const clientInfo: ClientInfo = {
      socket,
      userId,
      userName,
      connectedAt: new Date(),
    };
    const existingClient = this.clientsByUserId.get(userId);
    if (existingClient) {
      existingClient.socket.close(1000, 'New connection established');
    }
    this.clientsByUserId.set(userId, clientInfo);
    this.userIdByName.set(userName, userId);
    this.userIdBySocket.set(socket, userId);
  }
  public removeClient(socket: WebSocket): void {
    const userId = this.userIdBySocket.get(socket);
    if (!userId) return;
    const clientInfo = this.clientsByUserId.get(userId);
    if (clientInfo) this.userIdByName.delete(clientInfo.userName);
    this.clientsByUserId.delete(userId);
    this.userIdBySocket.delete(socket);
  }
  public async sendPrivateMessage(senderSocket: WebSocket, rawMessage: string): Promise<void> {
    const senderId = this.userIdBySocket.get(senderSocket);
    if (!senderId) {
      return;
    }
    const senderInfo = this.clientsByUserId.get(senderId);
    if (!senderInfo) {
      return;
    }
    try {
      const message: PrivateMessage = JSON.parse(rawMessage);
      if (!message.to || typeof message.to !== 'string') {
        this.sendError(senderSocket, 'Missing recipient username');
        return;
      }

      if (!message.content || typeof message.content !== 'string') {
        this.sendError(senderSocket, 'Invalid message content');
        return;
      }
      const recipientResult = await this.userRepository.getUserByName({ name: message.to });
      if (!recipientResult.isSuccess || !recipientResult.value) {
        this.sendError(senderSocket, `User '${message.to}' not found`);
        return;
      }
      const recipientId = recipientResult.value.id;
      const recipientName = recipientResult.value.name;
      const createMessageDto = CreateMessageDto.create({
        owner: senderId,
        content: JSON.stringify({
          to: recipientId,
          toName: recipientName,
          content: message.content,
          timestamp: new Date().toISOString()
        })
      });
      if (!createMessageDto.isSuccess) {
        this.sendError(senderSocket, 'Invalid message format');
        return;
      }
      const savedMessage = await this.messageRepository.addMessageOfUser({
        userId: senderId,
        content: createMessageDto.value!.content
      });
      if (!savedMessage.isSuccess) {
        this.sendError(senderSocket, 'Failed to save message');
        return;
      }
      const recipientClient = this.clientsByUserId.get(recipientId);
      if (!recipientClient) {
        this.sendAck(senderSocket, {
          status: 'saved',
          to: recipientName,
          delivered: false,
          messageId: savedMessage.value?.id,
          timestamp: new Date().toISOString()
        });
        return;
      }
      if (recipientClient.socket.readyState !== WebSocket.OPEN) {
        this.sendAck(senderSocket, {
          status: 'saved',
          to: recipientName,
          delivered: false,
          messageId: savedMessage.value?.id,
          timestamp: new Date().toISOString()
        });
        return;
      }
      const messageToSend = {
        type: 'message',
        from: senderInfo.userName,
        to: recipientName,
        content: message.content,
        messageId: savedMessage.value?.id,
        timestamp: new Date().toISOString()
      };
      recipientClient.socket.send(JSON.stringify(messageToSend));
      this.sendAck(senderSocket, {
        status: 'delivered',
        to: recipientName,
        delivered: true,
        messageId: savedMessage.value?.id,
        timestamp: messageToSend.timestamp
      });

    } catch (error) {
      this.sendError(senderSocket, 'Internal server error', error.message);
    }
  }
  private sendError(socket: WebSocket, error: string, details?: string): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'error',
        error,
        details,
        timestamp: new Date().toISOString()
      }));
    }
  }
  private sendAck(socket: WebSocket, data: any): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'ack',
        ...data
      }));
    }
  }
  public getOnlineUsers(): string[] {
    return Array.from(this.clientsByUserId.values()).map(client => client.userName);
  }
  public isUserOnlineByName(userName: string): boolean {
    return this.userIdByName.has(userName);
  }
  public getConnectedClientsCount(): number {
    return this.clientsByUserId.size;
  }
}