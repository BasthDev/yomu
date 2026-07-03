#!/bin/bash

# Keystore generation script for Yomu Android app
# Run this script to generate a release keystore for signing your app

KEYSTORE_PATH="../android/app/release.keystore"
KEY_ALIAS="yomu-release-key"
KEY_PASSWORD="Basthdev04"
STORE_PASSWORD="Basthdev04"

echo "Generating release keystore for Yomu app..."
echo "Keystore will be saved to: $KEYSTORE_PATH"

# Check if keystore already exists
if [ -f "$KEYSTORE_PATH" ]; then
    echo "Keystore already exists at $KEYSTORE_PATH"
    echo "Please remove it first if you want to generate a new one"
    exit 1
fi

# Generate keystore
keytool -genkey -v -keystore "$KEYSTORE_PATH" -alias "$KEY_ALIAS" -keyalg RSA -keysize 2048 -validity 10000 -storepass "$STORE_PASSWORD" -keypass "$KEY_PASSWORD" -dname "CN=Yomu, OU=Development, O=BasthDev, L=City, ST=State, C=US"

if [ $? -eq 0 ]; then
    echo "✓ Keystore generated successfully!"
    echo "Keystore path: $KEYSTORE_PATH"
    echo "Key alias: $KEY_ALIAS"
    echo ""
    echo "IMPORTANT: Store these passwords securely!"
    echo "Keystore password: $STORE_PASSWORD"
    echo "Key password: $KEY_PASSWORD"
    echo ""
    echo "Next steps:"
    echo "1. Add these to your environment variables or .env file"
    echo "2. Configure EAS Build to use these credentials"
    echo "3. Or manually configure android/app/build.gradle for local builds"
else
    echo "✗ Failed to generate keystore"
    exit 1
fi
