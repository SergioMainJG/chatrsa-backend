class KVDatabase {
  private static instanceKV: KVDatabase;
  public static database: Deno.Kv | undefined;

  private constructor() {}
  
  public static async getInstance(): Promise<KVDatabase> {
    if (!KVDatabase.instanceKV) {
      KVDatabase.instanceKV = new KVDatabase();
      await KVDatabase.instanceKV.connect();
    }
    return KVDatabase.instanceKV;
  }
  private async connect(): Promise<void> {
    if (KVDatabase.database) return;
    try {
      KVDatabase.database = await Deno.openKv();
    } catch (error) {
      throw new Error("Could not establish Deno KV connection.", {cause: error});
    }
  }

  public getDb(): Deno.Kv {
    if (!KVDatabase.database) {
      throw new Error("Deno KV database is not initialized. Call getInstance() first.");
    }
    return KVDatabase.database;
  }

  public closeDatabase(): void {
    if (KVDatabase.database) {
      KVDatabase.database.close();
      KVDatabase.database = undefined;
    }
  }
}

export const kvInstance = (async () => {
  const kvService = await KVDatabase.getInstance();
  return kvService.getDb();
})();