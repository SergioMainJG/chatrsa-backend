import { JsonResponse } from "../utils/JsonResponse.ts";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

export type Controller = (
  req: Request,
  params?: Record<string, string | undefined>
) => Promise<Response | JsonResponse>;

export type WebSocketHandler = (req: Request) => Promise<Response> | Response;

export class Route {
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
  private _wsRoutes: Map<string, WebSocketHandler> = new Map();
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

  public websocket(pattern: string, handler: WebSocketHandler): Router {
    this._wsRoutes.set(pattern, handler);
    return this;
  }

  public handler = async (req: Request): Promise<Response> => {
    try {
      const url = new URL(req.url);
      const method = req.method as HttpMethod;
      const origin = req.headers.get('Origin') || '*';

      console.log(`📨 ${method} ${url.pathname}`);

      // 1. Manejar PREFLIGHT (OPTIONS)
      if (method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
          },
        });
      }

      // 2. Verificar si es WebSocket
      if (req.headers.get("upgrade") === "websocket") {
        console.log('🔌 WebSocket upgrade request');
        for (const [pattern, handler] of this._wsRoutes.entries()) {
          const urlPattern = new URLPattern({ pathname: pattern });
          if (urlPattern.exec(url)) {
            const response = await handler(req);
            return this.addCorsHeaders(response, origin);
          }
        }
        return new Response("WebSocket route not found", { status: 404 });
      }

      // 3. Rutas HTTP normales
      const methodRoutes = this._routes.get(method);
      if (!methodRoutes || methodRoutes.length === 0) {
        console.log(`❌ No routes for method: ${method}`);
        return this.addCorsHeaders(
          new Response(JSON.stringify({ error: `Method ${method} not allowed` }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
          }),
          origin
        );
      }

      for (const route of methodRoutes) {
        const urlPattern = route.createURLPattern(this.baseURL);
        const match = urlPattern.exec(url);

        if (match) {
          console.log(`✅ Route matched: ${route.pattern}`);
          const params = match.pathname.groups || {};
          const response = await route.controller(req, params);
          
          // ✅ CONVERTIR A RESPONSE SI ES JsonResponse
          if (response instanceof JsonResponse) {
            return this.addCorsHeaders(response, origin);
          }
          
          return this.addCorsHeaders(response, origin);
        }
      }

      console.log(`❌ No route found for: ${method} ${url.pathname}`);
      return this.addCorsHeaders(
        new Response(JSON.stringify({ error: `Route ${method} ${url.pathname} not found` }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }),
        origin
      );

    } catch (error) {
      console.error('❌ Router handler error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        details: error.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  };

  /**
   * Añade headers de CORS a una respuesta
   */
  private addCorsHeaders(response: Response, origin: string): Response {
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }

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
    
    if (this._wsRoutes.size > 0) {
      console.log("\n🔌 WebSocket Routes:");
      this._wsRoutes.forEach((_, pattern) => {
        console.log(`WS      ${pattern}`);
      });
    }
    
    console.log("=".repeat(50) + "\n");
  }
}