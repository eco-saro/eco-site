// lib/mongodb.ts
import mongoose from 'mongoose'


let cached = (global as any).mongoose || { conn: null, promise: null }

async function db() {
  const MONGODB_URI = process.env.MONGODB_URI!

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
    ; (global as any).mongoose = cached
  return cached.conn
}

export default db  // ✅ Now you're exporting a function
