// router.ts
import { JsonResponse } from "../utils/JsonResponse.ts";

// ... (El resto de tus tipos y la clase Route se mantienen igual)
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

export type Controller = (
  req: Request,
  params?: Record<string, string | undefined>
) => Promise<Response | JsonResponse>;

export class Route {
  // ... (código sin cambios)
  public static get(pattern: string, controller: Controller): Route {
    return new Route("GET", pattern, controller);
  }

  public static post(pattern: string, controller: Controller): Route {
    return new Route("POST", pattern, controller);
  }

  public static put(pattern: string, controller: Controller): Route {
    return new Route("PUT", pattern, controller);
  }

  public static patch(pattern: string, controller: Controller): Route {
    return new Route("PATCH", pattern, controller);
  }

  public static delete(pattern: string, controller: Controller): Route {
    return new Route("DELETE", pattern, controller);
  }

  private constructor(
    private readonly _method: HttpMethod,
    private readonly _pattern: string,
    private readonly _controller: Controller
  ) {}

  get method(): HttpMethod {
    return this._method;
  }

  get pattern(): string {
    return this._pattern;
  }

  get controller(): Controller {
    return this._controller;
  }

  public createURLPattern(baseURL?: string): URLPattern {
    return new URLPattern({ pathname: this._pattern });
  }
}

export class Router {
  private _routes: Map<HttpMethod, Route[]> = new Map();
  private baseURL: string;

  constructor(baseURL: string = "http://localhost") {
    this.baseURL = baseURL;
  }

  public route(route: Route): Router {
    const method = route.method;
    const existingRoutes = this._routes.get(method) || [];
    existingRoutes.push(route);
    this._routes.set(method, existingRoutes);
    return this;
  }

  public routes(routes: Route[]): Router {
    routes.forEach((route) => this.route(route));
    return this;
  }

  public handler = async (req: Request): Promise<Response> => {
    const method = req.method as HttpMethod;
    const url = new URL(req.url); // Ya tienes el objeto URL aquí.

    const methodRoutes = this._routes.get(method);
    if (!methodRoutes || methodRoutes.length === 0) {
      return this.sendNotFound(`Method ${method} not allowed`);
    }

    for (const route of methodRoutes) {
      const urlPattern = route.createURLPattern(this.baseURL);

      // --- ¡LA CORRECCIÓN ESTÁ AQUÍ! ---
      // En lugar de req.url (string), pasa el objeto 'url'
      const match = urlPattern.exec(url);

      if (match) {
        try {
          const params = match.pathname.groups || {};
          const response = await route.controller(req, params);
          if (response instanceof Response) {
            return response;
          }
          return new JsonResponse(
            { error: "Controller did not return a valid response" },
            { status: 500 }
          );
        } catch (error) {
          console.error("Error processing request:", error);
          return this.sendInternalError(error);
        }
      }
    }

    return this.sendNotFound(`Route ${method} ${url.pathname} not found`);
  };

  // ... (el resto de la clase Router sin cambios)
  public get(pattern: string, controller: Controller): Router {
    return this.route(Route.get(pattern, controller));
  }

  public post(pattern: string, controller: Controller): Router {
    return this.route(Route.post(pattern, controller));
  }

  public put(pattern: string, controller: Controller): Router {
    return this.route(Route.put(pattern, controller));
  }

  public patch(pattern: string, controller: Controller): Router {
    return this.route(Route.patch(pattern, controller));
  }

  public delete(pattern: string, controller: Controller): Router {
    return this.route(Route.delete(pattern, controller));
  }

  private sendNotFound(message: string = "Route not found"): JsonResponse {
    return new JsonResponse({ error: message }, { status: 404 });
  }

  private sendInternalError(error: unknown): JsonResponse {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return new JsonResponse({ error: message }, { status: 500 });
  }

  public getRoutes(): Map<HttpMethod, Route[]> {
    return new Map(this._routes);
  }

  public printRoutes(): void {
    console.log("\n📋 Registered Routes:");
    console.log("=".repeat(50));
    this._routes.forEach((routes, method) => {
      routes.forEach((route) => {
        console.log(`${method.padEnd(7)} ${route.pattern}`);
      });
    });
    console.log("=".repeat(50) + "\n");
  }
}