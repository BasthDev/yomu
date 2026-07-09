import dotenv from "dotenv";
import { Client, Storage } from "node-appwrite";

// Load environment variables
dotenv.config();

const endpoint =
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "";
const apiKey = process.env.EXPO_PUBLIC_APPWRITE_API_KEY || "";

console.log("🔍 Verifying Appwrite Storage Setup...");
console.log(`Endpoint: ${endpoint}`);
console.log(`Project ID: ${projectId}`);
console.log("----------------------------------------\n");

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const storage = new Storage(client);

async function verifyStorage() {
  try {
    // List all buckets
    const response = await storage.listBuckets();
    console.log(`Found ${response.buckets.length} bucket(s):`);
    response.buckets.forEach((bucket: any) => {
      console.log(`  - ${bucket.name} (${bucket.$id})`);
    });
    console.log("----------------------------------------");

    if (response.buckets.length === 0) {
      console.log("❌ No buckets found. Please create a bucket in the Appwrite console.");
      process.exit(1);
    }

    // Use the first bucket
    const bucket = response.buckets[0];
    console.log(`\n✅ Using bucket: ${bucket.name} (${bucket.$id})`);
    console.log("\n📁 Folder-based organization structure:");
    console.log("   /novel-covers/ - Novel cover images");
    console.log("   /novel-banners/ - Novel banner images");
    console.log("   /profile-images/ - User profile images");
    console.log("   /chapter-images/ - Chapter-specific images");
    console.log("   /inline-images/ - Inline content images");
    console.log("   /banners/ - Platform banners");
    console.log("   /ads/ - Advertisement assets");
    console.log("   /audio/ - Audio files");
    console.log("   /videos/ - Video files");
    console.log("   /documents/ - Document files");
    console.log("   /temporary-uploads/ - Temporary upload staging");
    
    console.log("\n⚠️ Make sure this bucket ID is in config.ts:");
    console.log(`   STORAGE: "${bucket.$id}"`);
    
    console.log("\n✅ Storage verification complete!");
    console.log("\n📝 Next steps:");
    console.log("   1. Configure bucket permissions in Appwrite console");
    console.log("   2. Configure collection permissions in Appwrite console");
    console.log("   3. Test file uploads using the storage service");
  } catch (error) {
    console.error("\n❌ Storage verification failed:", error);
    process.exit(1);
  }
}

verifyStorage();
