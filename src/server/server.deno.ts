import { Router } from "../routes/router.ts";

export class ServerDeno {
  constructor(
    private readonly port: number,
    private readonly hostname: string,
    private readonly router: Router
  ) {}

  async start() {
    console.log(`\n🚀 Starting server on http://${this.hostname}:${this.port}`);
    this.router.printRoutes();
    
    try {
      const app = Deno.serve({
        port: this.port,
        hostname: this.hostname,
        handler: this.router.handler,
        onListen: ({ port, hostname }) => {
          console.log(`✅ Server running on http://${hostname}:${port}`);
        },
      });

      await app.finished;
    } catch (error) {
      console.error('❌ Server failed to start:', error);
      throw error;
    }
  }
}