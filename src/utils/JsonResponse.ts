class JsonResponse extends Response {
  constructor(body: any, init?: ResponseInit) {
    const jsonBody = JSON.stringify(body);
    init = {
      ...init,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        ...(init?.headers || {}),
      },
    };
    super(jsonBody, init);
  }
}