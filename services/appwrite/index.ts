// Export all Appwrite services for easy importing
export { AuthService, authService } from "./auth";
export {
    APPWRITE_CONFIG, BUCKETS, COLLECTIONS, DATABASE_ID, client,
    databases,
    storage
} from "./config";
export {
    StorageService, storageService, uploadAudio, uploadDocument,
    uploadTemporaryFile, uploadVideo
} from "./storage";

