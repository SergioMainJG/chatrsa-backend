interface ClientInfo {
  userId: number;
  userName: string;
}

export class MessageService {
  private clients = new Map<WebSocket, ClientInfo>();
  public addClient(socket: WebSocket, userId: number, userName: string): void {
    for (const [clientSocket, clientInfo] of this.clients.entries()) {
      if (clientInfo.userId === userId) {
        clientSocket.close(1000, 'New connection established');
        this.clients.delete(clientSocket);
      }
    }
    this.clients.set(socket, { userId, userName });
    this.broadcastOnlineUsers();
  }
  public removeClient(socket: WebSocket): void {
    if (this.clients.has(socket)) {
      this.clients.delete(socket);
      this.broadcastOnlineUsers();
    }
  }
  public getClientInfo(socket: WebSocket): ClientInfo | undefined {
    return this.clients.get(socket);
  }
  public getOnlineUsers(): ClientInfo[] {
    return Array.from(this.clients.values());
  }
  public broadcast(message: string): void {
    for (const client of this.clients.keys()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
  public broadcastOnlineUsers(): void {
    const message = JSON.stringify({
      type: 'online_users',
      users: this.getOnlineUsers(),
      timestamp: new Date().toISOString(),
    });
    this.broadcast(message);
  }
}