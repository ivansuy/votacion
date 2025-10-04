// src/config/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://obhmyybujxrnbghfejst.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iaG15eWJ1anhybmJnaGZlanN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTgyMTQsImV4cCI6MjA3NDc3NDIxNH0.qp4WlMM2-zCVNUJ6tFUPOzJYgz9w6Ir4KtmmXC8lHy0";
export const supabase = createClient(supabaseUrl, supabaseKey);
    