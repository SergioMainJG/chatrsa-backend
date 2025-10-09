import { corsMiddleware } from "../middlwares/cors.middleware.ts";
import { Router } from "../routes/router.ts";

export class ServerDeno {
  public readonly app: any;

  constructor(
    // private readonly port: number,
    // private readonly hostname: string,
    private readonly router: Router
  ) {}

  async start() {
    const corsHandler = corsMiddleware(this.router.handler);
    const app = Deno.serve({
      // port: this.port,
      // hostname: this.hostname,
      handler: async (req: Request): Promise<Response> => {
        // const url = new URL(req.url);
        // if (req.headers.get("upgrade") === "websocket") {
        // }
        return await corsHandler(req);
      },
      onListen: () => {
      },
    });

    await app.finished;
  }
}