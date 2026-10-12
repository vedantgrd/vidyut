import { PrismaClient } from '@prisma/client'

const g = globalThis as unknown as { prisma: PrismaClient | undefined }

// Fallback to active Neon DB if DATABASE_URL is missing or still set to unreachable port 5433
const NEON_URL = "postgresql://neondb_owner:npg_f3r6DxeMdlqL@ep-nameless-king-b3glnb65-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

const activeUrl = (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes(':5433'))
  ? process.env.DATABASE_URL
  : NEON_URL

export const prisma = g.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: activeUrl
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') g.prisma = prisma
