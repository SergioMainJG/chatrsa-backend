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
    this.router.printRoutes();
    const app = Deno.serve({
      port: this.port,
      hostname: this.hostname,
      handler: this.router.handler,
      onListen: ({ port, hostname }) => {
        console.log(`Server running on http://${hostname}:${port}`);
      },
    });

    await app.finished;
  }
}
