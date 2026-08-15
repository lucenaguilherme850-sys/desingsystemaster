import { createClient } from "@supabase/supabase-js";

async function fixRoles() {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const userId = "9287b5f4-ea46-43be-972e-cad7068921a2";

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("Adding roles for user:", userId);
  const { data, error } = await supabase
    .from("user_roles")
    .upsert([
      { user_id: userId, role: "pro" },
      { user_id: userId, role: "plus" },
      { user_id: userId, role: "admin" }
    ], { onConflict: "user_id,role" });

  if (error) {
    console.error("Error adding roles:", error);
  } else {
    console.log("Successfully added roles:", data);
  }
}

fixRoles();