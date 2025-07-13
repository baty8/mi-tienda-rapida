import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oucrwfmkjkgvlqbsaqbj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Y3J3Zm1ramtndmxxYnNhcWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTY5ODIsImV4cCI6MjA2Nzg3Mjk4Mn0.ayJrybO13bsPC1OeWYfAUyDxRwfOBhHP7wdug4Le_FM'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;