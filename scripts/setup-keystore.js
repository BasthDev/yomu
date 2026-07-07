const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GRADLE_PROPERTIES = path.join(ROOT, "android", "gradle.properties");
const BUILD_GRADLE = path.join(ROOT, "android", "app", "build.gradle");

// ---------------------------------------------------------------------------
// Load .env — fallback for when env vars aren't exported to the shell
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  const env = {};
  if (!fs.existsSync(envPath)) return env;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return env;
}

const env = loadEnv();

const storeFile =
  process.env.ANDROID_KEYSTORE_FILE || env.ANDROID_KEYSTORE_FILE || "release.keystore";
const keyAlias =
  process.env.ANDROID_KEYSTORE_ALIAS || env.ANDROID_KEYSTORE_ALIAS;
const storePassword =
  process.env.ANDROID_KEYSTORE_PASSWORD || env.ANDROID_KEYSTORE_PASSWORD;
const keyPassword =
  process.env.ANDROID_KEY_PASSWORD || env.ANDROID_KEY_PASSWORD;

if (!keyAlias || !storePassword || !keyPassword) {
  console.error(
    "\n❌  Missing keystore credentials.\n" +
      "   Set ANDROID_KEYSTORE_ALIAS, ANDROID_KEYSTORE_PASSWORD, and ANDROID_KEY_PASSWORD\n" +
      "   in your .env file or shell environment.\n"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Update gradle.properties — write as plain UTF-8, removing old entries first
// ---------------------------------------------------------------------------
if (!fs.existsSync(GRADLE_PROPERTIES)) {
  console.error("❌  gradle.properties not found — run expo prebuild first.");
  process.exit(1);
}

// Read as UTF-8 and strip any leftover null bytes from the old UTF-16 bug
let gradleProps = fs.readFileSync(GRADLE_PROPERTIES, "utf8").replace(/\u0000/g, "");

// Remove any existing keystore lines
[
  "MYAPP_UPLOAD_STORE_FILE",
  "MYAPP_UPLOAD_KEY_ALIAS",
  "MYAPP_UPLOAD_STORE_PASSWORD",
  "MYAPP_UPLOAD_KEY_PASSWORD",
].forEach((key) => {
  gradleProps = gradleProps.replace(new RegExp(`^${key}=.*$`, "gm"), "");
});

// Remove blank lines left behind by the removal above (more than one consecutive blank)
gradleProps = gradleProps.replace(/\n{3,}/g, "\n\n").trimEnd();

// Append the new entries
gradleProps +=
  `\n\n# Release keystore (injected by scripts/setup-keystore.js)\n` +
  `MYAPP_UPLOAD_STORE_FILE=${storeFile}\n` +
  `MYAPP_UPLOAD_KEY_ALIAS=${keyAlias}\n` +
  `MYAPP_UPLOAD_STORE_PASSWORD=${storePassword}\n` +
  `MYAPP_UPLOAD_KEY_PASSWORD=${keyPassword}\n`;

// Write back as explicit UTF-8
fs.writeFileSync(GRADLE_PROPERTIES, gradleProps, "utf8");
console.log("✓ Updated gradle.properties (UTF-8, null-bytes removed)");

// ---------------------------------------------------------------------------
// Update android/app/build.gradle — only if signingConfigs block is missing
// ---------------------------------------------------------------------------
let buildGradle = fs.readFileSync(BUILD_GRADLE, "utf8");

if (!buildGradle.includes("MYAPP_UPLOAD_STORE_FILE")) {
  const signingConfig = `
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
`;

  buildGradle = buildGradle.replace(
    /android\s*\{/,
    `android {\n${signingConfig}`
  );

  buildGradle = buildGradle.replace(
    /buildTypes\s*\{/,
    `buildTypes {
        release {
            signingConfig signingConfigs.release
        }`
  );

  fs.writeFileSync(BUILD_GRADLE, buildGradle, "utf8");
  console.log("✓ Updated build.gradle with signingConfigs block");
} else {
  console.log("✓ build.gradle already configured — skipped");
}
