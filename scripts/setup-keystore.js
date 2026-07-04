const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GRADLE_PROPERTIES = path.join(ROOT, "android", "gradle.properties");
const BUILD_GRADLE = path.join(ROOT, "android", "app", "build.gradle");

const config = `
MYAPP_UPLOAD_STORE_FILE=release.keystore
MYAPP_UPLOAD_KEY_ALIAS=yomu-release-key
MYAPP_UPLOAD_STORE_PASSWORD=Basthdev04
MYAPP_UPLOAD_KEY_PASSWORD=Basthdev04
`;

if (!fs.existsSync(GRADLE_PROPERTIES)) {
  console.error("gradle.properties not found");
  process.exit(1);
}

let gradleProps = fs.readFileSync(GRADLE_PROPERTIES, "utf8");

[
  "MYAPP_UPLOAD_STORE_FILE",
  "MYAPP_UPLOAD_KEY_ALIAS",
  "MYAPP_UPLOAD_STORE_PASSWORD",
  "MYAPP_UPLOAD_KEY_PASSWORD",
].forEach((key) => {
  const regex = new RegExp(`^${key}=.*$`, "gm");
  gradleProps = gradleProps.replace(regex, "");
});

gradleProps += "\n" + config;

fs.writeFileSync(GRADLE_PROPERTIES, gradleProps);

console.log("✓ Updated gradle.properties");

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
    `android {\n${signingConfig}`,
  );

  buildGradle = buildGradle.replace(
    /buildTypes\s*\{/,
    `buildTypes {
        release {
            signingConfig signingConfigs.release
        }`,
  );

  fs.writeFileSync(BUILD_GRADLE, buildGradle);

  console.log("✓ Updated build.gradle");
} else {
  console.log("✓ build.gradle already configured");
}
