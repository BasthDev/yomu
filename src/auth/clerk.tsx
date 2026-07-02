import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import * as React from "react";

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export const ClerkProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.warn("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env file");
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={publishableKey}
    >
      <ClerkLoaded>
        {children}
      </ClerkLoaded>
    </ClerkProvider>
  );
};
