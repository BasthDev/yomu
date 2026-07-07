const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '../app.json');
const appJson = require(appJsonPath);

// Bump version (patch)
const versionParts = appJson.expo.version.split('.');
versionParts[2] = parseInt(versionParts[2], 10) + 1;
appJson.expo.version = versionParts.join('.');

// Bump Android versionCode
if (!appJson.expo.android) appJson.expo.android = {};
if (!appJson.expo.android.versionCode) {
  appJson.expo.android.versionCode = 2;
} else {
  appJson.expo.android.versionCode += 1;
}

// Bump iOS buildNumber
if (!appJson.expo.ios) appJson.expo.ios = {};
if (!appJson.expo.ios.buildNumber) {
  appJson.expo.ios.buildNumber = '2';
} else {
  appJson.expo.ios.buildNumber = (parseInt(appJson.expo.ios.buildNumber, 10) + 1).toString();
}

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log(`Version bumped to ${appJson.expo.version} (Android: ${appJson.expo.android.versionCode}, iOS: ${appJson.expo.ios.buildNumber})`);
