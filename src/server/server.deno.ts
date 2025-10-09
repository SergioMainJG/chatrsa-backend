import { corsMiddleware } from "../middlwares/cors.middleware.ts";
import { Router } from "../routes/router.ts";

export class ServerDeno {
  public readonly app: any;

  constructor(
    private readonly port: number,
    private readonly hostname: string,
    private readonly router: Router
  ) {}

  async start() {
    console.log(`\n Starting server on http://${this.hostname}:${this.port}`);
    const corsHandler = corsMiddleware(this.router.handler);
    const app = Deno.serve({
      port: this.port,
      hostname: this.hostname,
      handler: async (req: Request): Promise<Response> => {
        const url = new URL(req.url);
        console.log(`📨 ${req.method} ${url.pathname}`);
        if (req.headers.get("upgrade") === "websocket") {
          console.log("🔌 WebSocket upgrade request detected");
        }
        return await corsHandler(req);
      },
      onListen: ({ port, hostname }) => {
        console.log(`Server running on http://${hostname}:${port}`);
      },
    });

    await app.finished;
  }
}
