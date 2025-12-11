
import dotenv from "dotenv";
dotenv.config();
import { boltic } from "./services/bolticService";

async function debugTables() {
  console.log("---- Debugging Boltic Tables ----");

  const tableNames = [
    "user_contact_mapping",
    "User Contact Mapping",
    "UserContactMapping",
    "user_mapping"
  ];

  for (const table of tableNames) {
    console.log(`\nChecking table: '${table}'...`);
    try {
      // Try to select 1 record
      // We need to be careful with quoting. bolticService usually doesn't double quote table names in raw SQL unless we put them there?
      // actually bolticService.executeSql takes a raw string.
      // But the service helper methods build strings.
      // Let's try raw SQL via a hack or adding a helper. 
      // bolticService.executeSql is private. 
      // I will access it via 'any' cast or add a public method temporarily if needed, 
      // but actually I can just use `insertRecord` and see if it fails, or better, 
      // I'll modify the script to import the raw client if possible, but bolticService wraps it.
      
      // Since executeSql is private, I'll rely on a small reflection hack or just add a temporary public method to the service if I was editing it, 
      // but here I am writing a consumer script. 
      
      // Wait, bolticService.ts exports 'boltic' which is a proxy.
      // I can't easily access private methods. 
      
      // I'll try to use `getLeaderboard` style query but manually crafted if there was an injection point, but there isn't.
      
      // Actually, I can just try to use `boltic["client"].sql.executeSQL(...)` if I cast to any.
      
      const client = (boltic as any).client || (boltic as any)["bolticInstance"]?.client;
      // client might not be initialized on the proxy directly until accessed?
      // The proxy handles get. "bolticInstance" is module-level var not on the object.
      // I'll just trigger valid init first.
      
      await boltic.getUser("init"); 
      
      // Now reach into internals (it's JS/TS after all)
      // The exported 'boltic' is a proxy. The underlying instance is hidden in module scope closures 
      // BUT `boltic` allows access to properties. 
      // (boltic as any).client won't work because the proxy redirects all gets to the instance.
      // So yes, (boltic as any).client SHOULD work if the instance has a public client. 
      // But 'private client' in TS is only compile time. In runtime it is there.
      
      const instance = (boltic as any); 
      const realClient = instance.client;
      
      if (!realClient) {
          console.log("Could not access Boltic Client.");
          return;
      }

      const query1 = `SELECT * FROM "${table}" LIMIT 1`;
      console.log(`Current Query: ${query1}`);
      const res = await realClient.sql.executeSQL(query1);
      
      if (res.error) {
        console.log(`❌ Error: ${JSON.stringify(res.error)}`);
      } else {
        console.log(`✅ Success! Table '${table}' exists.`);
        console.log("Data:", res.data);
      }

    } catch (e: any) {
      console.log(`❌ Exception: ${e.message}`);
    }
  }
}

debugTables().then(() => process.exit(0));
