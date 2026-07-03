const fs = require('fs');
const path = require('path');

// Read current app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Parse current version
const currentVersion = appJson.expo.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Increment version based on build type
const buildType = process.env.BUILD_TYPE || 'patch';

let newVersion;
switch (buildType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update version in app.json
appJson.expo.version = newVersion;

// Write back to app.json
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log(`Version updated from ${currentVersion} to ${newVersion}`);
console.log(`Build type: ${buildType}`);
