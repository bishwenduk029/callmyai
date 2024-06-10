'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

import { auth } from '@/auth'
import { type Chat } from '@/lib/types'
import { db } from '@/lib/db'
import { users, contents } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

export async function getContents(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const results = await db
      .select()
      .from(contents)
      .where(eq(contents.userId, userId))

    return results
  } catch (error) {
    return []
  }
}
