// plugins/withAndroidKeystore.js
// Expo config plugin — runs automatically on every `expo prebuild`.
// 1. Copies secrets/release.keystore → android/app/release.keystore
// 2. Injects MYAPP_UPLOAD_* into gradle.properties (UTF-8, no null bytes)
// 3. Patches android/app/build.gradle with a release signingConfig block

const { withGradleProperties, withAppBuildGradle } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function loadEnv(projectRoot) {
  const envPath = path.join(projectRoot, ".env");
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return env;
}

// ---------------------------------------------------------------------------
// Step 1 — Copy keystore from secrets/ → android/app/
// ---------------------------------------------------------------------------
function withKeystoreCopy(config) {
  // We use withAppBuildGradle only as a hook to run side-effects before Gradle
  // reads anything. The actual copy happens here in the mod callback.
  return withAppBuildGradle(config, (mod) => {
    const projectRoot = mod.modRequest.projectRoot;
    const env = loadEnv(projectRoot);

    const storeFile =
      process.env.ANDROID_KEYSTORE_FILE || env.ANDROID_KEYSTORE_FILE || "release.keystore";

    // Source: secrets/<storeFile> (safe location outside /android)
    const srcPath = path.join(projectRoot, "secrets", storeFile);
    // Destination: android/app/<storeFile>
    const destPath = path.join(projectRoot, "android", "app", storeFile);

    if (!fs.existsSync(srcPath)) {
      console.warn(
        `\n⚠️  [withAndroidKeystore] Keystore source not found: ${srcPath}\n` +
          "   Run: node scripts/generate-keystore.js  (or place your keystore in secrets/)\n"
      );
      return mod;
    }

    // Always copy so the file is fresh after every prebuild --clean
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ [withAndroidKeystore] Copied ${storeFile} → android/app/${storeFile}`);

    // Patch build.gradle contents in this same hook
    let contents = mod.modResults.contents;

    // ---- Add signingConfigs.release block if missing ----
    if (!contents.includes("MYAPP_UPLOAD_STORE_FILE")) {
      const releaseSigningBlock = `
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
`;
      if (/signingConfigs\s*\{/.test(contents)) {
        contents = contents.replace(
          /\s*signingConfigs\s*\{[^]*?\n    \}/,
          releaseSigningBlock
        );
      } else {
        contents = contents.replace(/android\s*\{/, `android {${releaseSigningBlock}`);
      }
      console.log("✓ [withAndroidKeystore] signingConfigs.release added to build.gradle");
    }

    // ---- Point release buildType at signingConfigs.release ----
    if (
      /signingConfig\s+signingConfigs\.debug/.test(contents) &&
      !contents.includes("signingConfig signingConfigs.release")
    ) {
      contents = contents.replace(
        /(\bbuildTypes\b[\s\S]*?\brelease\b\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
        "$1signingConfig signingConfigs.release"
      );
      console.log("✓ [withAndroidKeystore] release buildType → signingConfigs.release");
    }

    mod.modResults.contents = contents;
    return mod;
  });
}

// ---------------------------------------------------------------------------
// Step 2 — Inject keystore props into gradle.properties
// ---------------------------------------------------------------------------
function withKeystoreProperties(config) {
  return withGradleProperties(config, (mod) => {
    const projectRoot = mod.modRequest.projectRoot;
    const env = loadEnv(projectRoot);

    const storeFile =
      process.env.ANDROID_KEYSTORE_FILE || env.ANDROID_KEYSTORE_FILE || "release.keystore";
    const keyAlias =
      process.env.ANDROID_KEYSTORE_ALIAS || env.ANDROID_KEYSTORE_ALIAS;
    const storePassword =
      process.env.ANDROID_KEYSTORE_PASSWORD || env.ANDROID_KEYSTORE_PASSWORD;
    const keyPassword =
      process.env.ANDROID_KEY_PASSWORD || env.ANDROID_KEY_PASSWORD;

    if (!keyAlias || !storePassword || !keyPassword) {
      console.warn(
        "\n⚠️  [withAndroidKeystore] Missing keystore env vars.\n" +
          "   Set ANDROID_KEYSTORE_ALIAS, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_PASSWORD in .env\n"
      );
      return mod;
    }

    // Remove stale entries
    const keysToRemove = [
      "MYAPP_UPLOAD_STORE_FILE",
      "MYAPP_UPLOAD_KEY_ALIAS",
      "MYAPP_UPLOAD_STORE_PASSWORD",
      "MYAPP_UPLOAD_KEY_PASSWORD",
    ];
    mod.modResults = mod.modResults.filter(
      (item) => !(item.type === "property" && keysToRemove.includes(item.key))
    );

    // Inject fresh entries
    mod.modResults.push(
      { type: "property", key: "MYAPP_UPLOAD_STORE_FILE", value: storeFile },
      { type: "property", key: "MYAPP_UPLOAD_KEY_ALIAS", value: keyAlias },
      { type: "property", key: "MYAPP_UPLOAD_STORE_PASSWORD", value: storePassword },
      { type: "property", key: "MYAPP_UPLOAD_KEY_PASSWORD", value: keyPassword }
    );

    console.log("✓ [withAndroidKeystore] Keystore props injected into gradle.properties");
    return mod;
  });
}

// ---------------------------------------------------------------------------
// Compose into a single plugin
// ---------------------------------------------------------------------------
const withAndroidKeystore = (config) => {
  config = withKeystoreProperties(config);
  config = withKeystoreCopy(config);
  return config;
};

module.exports = withAndroidKeystore;
