import { Router } from "../routes/router.ts";

export class ServerDeno {
  public readonly app: any;

  constructor(
    // private readonly port: number,
    // private readonly hostname: string,
    private readonly router: Router
  ) {}

  async start() {
    const app = Deno.serve({
      // port: this.port,
      // hostname: this.hostname,
      handler: async (req: Request): Promise<Response> => {
        const url = new URL(req.url);
        if (req.headers.get("upgrade") === "websocket") {
        }
        return await this.router.handler(req);
      },
      onListen: ({ port, hostname }) => {
      },
    });

    await app.finished;
  }
}