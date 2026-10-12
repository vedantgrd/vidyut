import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3'

export interface StorageDriver {
  saveFile(userId: string, filename: string, buffer: Buffer, mimeType: string): Promise<string>
  getFile(filePath: string): Promise<Buffer>
  deleteFile(filePath: string): Promise<void>
}

function resolveUploadsDir(): string {
  if (process.env.STORAGE_PATH) {
    return resolve(process.env.STORAGE_PATH)
  }
  const candidates = [
    resolve(process.cwd(), 'apps/server/uploads'),
    resolve(process.cwd(), 'uploads'),
    resolve(process.cwd(), '../uploads'),
  ]
  for (const c of candidates) {
    if (existsSync(c)) return c
  }
  if (existsSync(resolve(process.cwd(), 'apps/server'))) {
    return resolve(process.cwd(), 'apps/server/uploads')
  }
  return resolve(process.cwd(), 'uploads')
}

class LocalStorageDriver implements StorageDriver {
  private basePath: string

  constructor(basePath: string = resolveUploadsDir()) {
    this.basePath = resolve(basePath)
  }

  private getCandidateBases(): string[] {
    const unique = new Set<string>([
      this.basePath,
      resolve(process.cwd(), 'apps/server/uploads'),
      resolve(process.cwd(), 'uploads'),
      resolve(process.cwd(), '../uploads'),
      resolve(process.cwd(), '../../uploads'),
    ])
    return Array.from(unique)
  }

  async saveFile(userId: string, filename: string, buffer: Buffer, _mimeType: string): Promise<string> {
    const userDir = join(this.basePath, userId)
    await mkdir(userDir, { recursive: true })
    const fullPath = join(userDir, filename)
    await writeFile(fullPath, buffer)
    return `/${userId}/${filename}`
  }

  async getFile(filePath: string): Promise<Buffer> {
    const sanitizedRelPath = filePath.replace(/^\//, '')
    const candidates = this.getCandidateBases()

    for (const base of candidates) {
      const fullPath = resolve(base, sanitizedRelPath)
      if (fullPath.startsWith(base) && existsSync(fullPath)) {
        return await readFile(fullPath)
      }
    }

    throw new Error('FILE_NOT_FOUND')
  }

  async deleteFile(filePath: string): Promise<void> {
    const sanitizedRelPath = filePath.replace(/^\//, '')
    const candidates = this.getCandidateBases()

    for (const base of candidates) {
      try {
        const fullPath = resolve(base, sanitizedRelPath)
        if (fullPath.startsWith(base) && existsSync(fullPath)) {
          await unlink(fullPath)
          return
        }
      } catch (err) {
        console.warn(`[LocalStorage] Failed to delete file ${filePath} at ${base}:`, err)
      }
    }
  }
}

class S3StorageDriver implements StorageDriver {
  private client: S3Client
  private bucket: string
  private prefix: string

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? ''
    this.prefix = process.env.S3_PREFIX ?? 'vidyut-vault'
    this.client = new S3Client({
      region: process.env.S3_REGION ?? 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? ''
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
    })
  }

  private getKey(filePath: string): string {
    const cleaned = filePath.replace(/^\//, '')
    return this.prefix ? `${this.prefix}/${cleaned}` : cleaned
  }

  async saveFile(userId: string, filename: string, buffer: Buffer, mimeType: string): Promise<string> {
    const filePath = `/${userId}/${filename}`
    const key = this.getKey(filePath)

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      Metadata: {
        uploadedBy: userId
      }
    }))

    return filePath
  }

  async getFile(filePath: string): Promise<Buffer> {
    const key = this.getKey(filePath)
    const res = await this.client.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    }))

    if (!res.Body) {
      throw new Error('FILE_NOT_FOUND')
    }

    const byteArray = await res.Body.transformToByteArray()
    return Buffer.from(byteArray)
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const key = this.getKey(filePath)
      await this.client.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      }))
    } catch (err) {
      console.warn(`[S3Storage] Failed to delete key for ${filePath}:`, err)
    }
  }
}

export function createStorageService(): StorageDriver {
  const driverType = process.env.STORAGE_DRIVER?.toLowerCase() ?? (process.env.S3_BUCKET ? 's3' : 'local')
  if (driverType === 's3' && process.env.S3_BUCKET) {
    return new S3StorageDriver()
  }
  return new LocalStorageDriver()
}

export const storageService = createStorageService()
