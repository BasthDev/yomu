
import * as fs from 'fs';
import * as path from 'path';
import { tableSchemas } from './setup-appwrite.js'; // Wait, we need to make setup-appwrite export tableSchemas first!

// First, let's read the current appwrite.json
const appwriteJsonPath = path.join(__dirname, '..', 'appwrite.json');
const appwriteJson = JSON.parse(fs.readFileSync(appwriteJsonPath, 'utf8'));

// Define helper to convert our column format to Appwrite column format
function convertColumn(column: any) {
  const base: any = {
    key: column.key,
    type: column.type === 'float' ? 'double' : column.type,
    required: column.required,
    array: false,
    default: column.default,
  };
  if (column.type === 'string') {
    base.size = column.size;
    base.encrypt = false;
  } else if (column.type === 'integer' || column.type === 'float' || column.type === 'double') {
    if (column.min !== undefined) base.min = column.min;
    if (column.max !== undefined) base.max = column.max;
  } else if (column.type === 'datetime') {
    base.format = '';
  }
  return base;
}

// Define helper to convert our index format to Appwrite index format
function convertIndex(index: any) {
  return {
    key: index.key,
    type: index.type,
    status: 'available',
    columns: index.attributes,
    orders: index.orders,
  };
}

// Now, let's convert each table schema and add to appwriteJson.tables
for (const schema of tableSchemas) {
  // Skip the tables that are already in appwriteJson.tables
  if (appwriteJson.tables.some((table: any) => table.$id === schema.id)) {
    console.log(`Skipping existing table: ${schema.id}`);
    continue;
  }
  console.log(`Adding table: ${schema.id}`);
  const table = {
    $id: schema.id,
    $permissions: [],
    databaseId: appwriteJson.tables[0].databaseId,
    name: schema.name,
    enabled: true,
    rowSecurity: true,
    columns: schema.columns.map(convertColumn),
    indexes: schema.indexes.map(convertIndex),
  };
  appwriteJson.tables.push(table);
}

// Write back to appwrite.json
fs.writeFileSync(appwriteJsonPath, JSON.stringify(appwriteJson, null, 4));
console.log('Done! Updated appwrite.json with all tables!');
