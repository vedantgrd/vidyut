import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const rootDir = process.cwd();
const serverDir = path.join(rootDir, 'apps', 'server');
const envLivePath = path.join(serverDir, '.env.live');

console.log('⚡ Vidyut Remote Database Initializer & Migration Deployer');
console.log('----------------------------------------------------------\n');

let dbUrl = process.env.DATABASE_URL;

if (!dbUrl && fs.existsSync(envLivePath)) {
  const content = fs.readFileSync(envLivePath, 'utf8');
  const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (match) {
    dbUrl = match[1];
    console.log('Loaded DATABASE_URL from apps/server/.env.live (gitignored)');
  }
}

if (!dbUrl) {
  console.error('❌ Error: No DATABASE_URL found.');
  console.error('Please either:');
  console.error('  1. Create apps/server/.env.live containing: DATABASE_URL="postgresql://..."');
  console.error('  OR');
  console.error('  2. Set DATABASE_URL in your environment before running this script.\n');
  process.exit(1);
}

try {
  console.log('1. Deploying version-controlled Prisma migrations...');
  execSync('npx prisma migrate deploy', {
    cwd: serverDir,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });

  console.log('\n2. Seeding catalog & safe evaluator demo accounts...');
  execSync('npx tsx prisma/seed.ts', {
    cwd: serverDir,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl }
  });

  console.log('\n✅ Remote PostgreSQL database is fully migrated and seeded!');
  console.log('Safe Demo Accounts:');
  console.log('  Student: demo@vidyut.in  / Demo@1234');
  console.log('  Admin:   admin@vidyut.in / Admin@1234\n');
} catch (err) {
  console.error('\n❌ Migration/seeding failed:', err.message);
  process.exit(1);
}
