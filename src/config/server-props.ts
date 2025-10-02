

const DATABASE: Record<string, string> = {
  tableUser: Deno.env.get("TABLE_USER") ?? "UserDevolepment",
};

export const GLOBAL_CONFIG: Readonly<Record<
  string,
  Record<string, string> | string | number
>> = {
  DATABASE: { ...DATABASE },
  PORT: Deno.env.get("PORT") ?? 8080
};


