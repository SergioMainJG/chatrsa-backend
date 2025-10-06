import GLOBAL_CONFIG from "./config/env/get.env.ts";
import { ServerDeno } from './server/server.deno.ts';
import { AppRoutes } from './routes/app.routes.ts';

(async () => {
  await main();
})();

async function main() {
  const router = AppRoutes.getRouter();
  const server = new ServerDeno(
    GLOBAL_CONFIG.port,
    "localhost",
    router
  );
  await server.start();
}
