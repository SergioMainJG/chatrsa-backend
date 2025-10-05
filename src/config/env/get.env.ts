interface DATABASE_CONFIG {
  readonly pathDatabase: string;
  readonly nameDatabase: string;
  readonly tableUser: string;
  readonly tableMessage: string;
}

interface APP_CONFIG {
  readonly port: number;
  readonly database: DATABASE_CONFIG;
}

const PROD: boolean = Boolean(Deno.env.get("PROD"));

const getENVVars = (name: string, defaultValue: string): string => {
  const envVar = Deno.env.get(name.toUpperCase());
  if (
    PROD && !envVar
  ) {
    throw new Error(`The enviroment variable: ${name.toUpperCase()} is required to start the application`);
  }
  return envVar || defaultValue;
}

const DATABASE_CONFIG: DATABASE_CONFIG = {
  pathDatabase: getENVVars("PATH_DATABASE", "/var/data/"),
  nameDatabase: getENVVars("DATABASE", "chat-rsa-database.db"),
  tableUser: getENVVars("TABLE_USER", "Users"),
  tableMessage: getENVVars("TABLE_MESSAGE", "Messages")
}

const GLOBAL_CONFIG: APP_CONFIG = {
  port: Number(getENVVars("PORT", "3000")),
  database: DATABASE_CONFIG,
}

export default GLOBAL_CONFIG;