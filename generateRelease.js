const fs = require('fs');
const path = require('path');

const firmwareRoot = path.resolve(__dirname, 'firmware');

const subDirs = fs.readdirSync(firmwareRoot).filter(sub =>
  fs.statSync(path.join(firmwareRoot, sub)).isDirectory()
);

for (const subDir of subDirs) {
  const fullSubDirPath = path.join(firmwareRoot, subDir);
  const binFiles = fs.readdirSync(fullSubDirPath).filter(f => f.endsWith('.bin'));

  if (binFiles.length === 0) {
    console.log(`⚠️  No .bin files found in ${subDir} folder.`);
    continue;
  }

  const firmwareList = [];

  for (const file of binFiles) {
    const versionMatch = file.match(/_V?([\w.\-]+)\.bin$/);
    const version = versionMatch ? versionMatch[1] : 'unknown';
    const isPre = file.toLowerCase().includes('nightly') || file.toLowerCase().includes('beta');

    firmwareList.push({
      version,
      prerelease: isPre,
      file
    });

    const manifest = {
      name: file.replace(/\.bin$/, ''),
      version,
      builds: [
        {
          chipFamily: "ESP32",
          parts: [
            {
              path: file,
              offset: 0
            }
          ]
        }
      ]
    };

    const manifestPath = path.join(fullSubDirPath, file.replace(/\.bin$/, '.json'));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Created manifest: ${manifestPath}`);
  }

  const firmwareJsonPath = path.join(fullSubDirPath, 'firmware.json');
  fs.writeFileSync(firmwareJsonPath, JSON.stringify(firmwareList, null, 2));
  console.log(`✅ Created firmware list: ${firmwareJsonPath}`);
}
