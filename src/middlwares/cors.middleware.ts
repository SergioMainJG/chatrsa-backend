export const corsMiddleware = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    const allowedOrigins = [
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'https://chat-rsa-math.sergioar.dev'
    ];
    const origin = req.headers.get('Origin');
    const allowedOrigin = (origin && allowedOrigins.includes(origin)) ? origin : allowedOrigins[0];

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const response = await handler(req);
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);

    return response;
  };
};