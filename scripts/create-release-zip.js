import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = process.cwd();
const stageDir = path.join(rootDir, 'dist-release', 'vidyut');
const zipPath = path.join(rootDir, 'vidyut-v1.0.0-release.zip');

console.log('📦 Preparing clean release package for Vidyut v1.0.0...');

if (fs.existsSync(path.join(rootDir, 'dist-release'))) {
  fs.rmSync(path.join(rootDir, 'dist-release'), { recursive: true, force: true });
}
if (fs.existsSync(zipPath)) {
  fs.rmSync(zipPath, { force: true });
}

fs.mkdirSync(stageDir, { recursive: true });

// Copy essential directories and files
const itemsToCopy = [
  'apps/server/src',
  'apps/server/prisma',
  'apps/server/package.json',
  'apps/server/tsconfig.json',
  'apps/server/.env.example',
  'apps/server/test-full-journey.ts',
  'apps/web/src',
  'apps/web/public',
  'apps/web/package.json',
  'apps/web/tsconfig.json',
  'apps/web/tsconfig.app.json',
  'apps/web/tsconfig.node.json',
  'apps/web/vite.config.ts',
  'apps/web/index.html',
  'apps/web/vercel.json',
  'apps/web/.env.example',
  'docs',
  'scripts',
  'docker-compose.yml',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  '.env.example',
  '.gitignore',
  '.oxlintrc.json',
  'README.md'
];

for (const item of itemsToCopy) {
  const src = path.join(rootDir, item);
  const dest = path.join(stageDir, item);

  if (!fs.existsSync(src)) {
    console.warn(`⚠️ Warning: ${item} does not exist, skipping.`);
    continue;
  }

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.cpSync(src, dest, {
      recursive: true,
      filter: (sourcePath) => {
        const basename = path.basename(sourcePath);
        if (
          basename === 'node_modules' ||
          basename === '.git' ||
          basename === 'dist' ||
          basename === 'uploads' ||
          basename === '.env' ||
          basename.endsWith('.tsbuildinfo')
        ) {
          return false;
        }
        return true;
      }
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log('🗜️ Compressing clean stage tree into ZIP archive...');
try {
  // Use tar.exe which is native on Windows 10/11
  execSync(`tar.exe -a -cf "${zipPath}" -C "${path.join(rootDir, 'dist-release')}" vidyut`, {
    stdio: 'inherit'
  });
} catch (e) {
  console.log('Falling back to PowerShell Compress-Archive...');
  execSync(
    `powershell.exe -Command "Compress-Archive -Path '${stageDir}' -DestinationPath '${zipPath}' -Force"`,
    { stdio: 'inherit' }
  );
}

// Clean up staging directory
fs.rmSync(path.join(rootDir, 'dist-release'), { recursive: true, force: true });

const stats = fs.statSync(zipPath);
console.log(`✅ Release package successfully generated at: ${zipPath} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
