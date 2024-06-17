'use server'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import { InitialMessage, InitialMessages } from '@/components/user-board';

export async function getContents(userId?: string | null) {
  if (!userId) {
    return []
  }

  const supabase = await createSupabaseServerClient();

  try {
    const results = await supabase.from("content")
    .select().returns<InitialMessages>()
    if(results.error) {
      console.error("Error fetching the content for the user")
      return []
    }

    return results.data
  } catch (error) {
    return []
  }
}
