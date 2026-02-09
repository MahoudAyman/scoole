import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://smtyuggglztoiyjwoxba.supabase.co'
const supabaseAnonKey = 'sb_publishable_sWPpEXiUgYR6b0cZU3UvdQ_hQO96nTt'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
