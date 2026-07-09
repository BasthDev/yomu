import * as dotenv from "dotenv";
import { Client, TablesDB } from "node-appwrite";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const {
  EXPO_PUBLIC_APPWRITE_ENDPOINT,
  EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  EXPO_PUBLIC_APPWRITE_API_KEY,
} = process.env;

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(EXPO_PUBLIC_APPWRITE_API_KEY!);

const tablesDB = new TablesDB(client);

console.log("Testing createTable...");
console.log("createTable function:", tablesDB.createTable.toString());
