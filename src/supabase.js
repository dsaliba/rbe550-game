import { createClient } from '@supabase/supabase-js'
console.log(process.env)
export default createClient(
  
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)
