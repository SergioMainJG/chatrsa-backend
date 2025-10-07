export class MessageService {
  private clients = new Set<WebSocket>();

  public addClient(socket: WebSocket): void {
    this.clients.add(socket);
    console.log(`Client connected. Total clients: ${this.clients.size}`);
  }

  public removeClient(socket: WebSocket): void {
    this.clients.delete(socket);
    console.log(`Client disconnected. Total clients: ${this.clients.size}`);
  }

  public broadcastMessage(originSocket: WebSocket, message: string): void {
    for (const client of this.clients) {
      if (client !== originSocket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
}