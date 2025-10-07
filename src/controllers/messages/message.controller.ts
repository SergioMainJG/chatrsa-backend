import { JWTAdapter } from '../../config/jwt/jwt.adapter.ts';
import { type MessageService } from '../../services/message/message.service.ts';

export class MessageController {
  constructor(
    private readonly messageService: MessageService,
  ) { }

  public handleConnection = async (socket: WebSocket, url: URL): Promise<void> => {
    try {
      const token = url.searchParams.get('token');
      if (!token) {
        console.error('WS Auth Error: No token provided.');
        socket.close(1008, 'No token provided');
        return;
      }

      const decodedToken = await JWTAdapter.validateToken<{ id: number }>(token);
      if (!decodedToken) {
        console.error('WS Auth Error: Invalid token.');
        socket.close(1008, 'Invalid token');
        return;
      }
      
      this.messageService.addClient(socket);
      
      socket.onmessage = (event) => {
        console.log('Message received, broadcasting...');
        this.messageService.broadcastMessage(socket, event.data);
      };

      socket.onclose = () => {
        this.messageService.removeClient(socket);
      };

      socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        this.messageService.removeClient(socket);
      };
      
    } catch (error) {
      console.error('Failed to handle WS connection:', error);
      socket.close(1011, 'Internal server error');
    }
  }
}