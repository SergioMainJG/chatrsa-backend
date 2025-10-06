import { JsonResponse } from "../utils/JsonResponse.ts";

type RouteHandler = (req: Request ) => Promise<void | JsonResponse>;

interface Route {
  pattern: URLPattern;
  handler: RouteHandler;
}

export class Router {
  private routes: Map<string, Route[]> = new Map();

  private addRoute(method: string, path: string, handler: RouteHandler): void {
    if (!this.routes.has(method)) {
      this.routes.set(method, []);
    }
    const routesForMethod = this.routes.get(method)!;
    routesForMethod.push({
      pattern: new URLPattern({ pathname: path }),
      handler
    });
  }

  get(path: string, handler: RouteHandler): void {
    this.addRoute('GET', path, handler);
  }

  post(path: string, handler: RouteHandler): void {
    this.addRoute('POST', path, handler);
  }
  delete(path: string, handler: RouteHandler): void {
    this.addRoute('DELETE', path, handler);
  }

  handleRequest(req: Request): Response | Promise<Response> {
    const { method } = req;
    const url = new URL(req.url);

    const routesForMethod = this.routes.get(method);
    if (!routesForMethod) {
      return this.sendNotFound();
    }

    for (const route of routesForMethod) {
      const match = route.pattern.exec(url);
      if (match) {
        return route.handler(req );
      }
    }

    return this.sendNotFound();
  }

  private sendNotFound(): Response {
    const body = JSON.stringify({ error: 'Route not found' });
    return new Response(body, {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}