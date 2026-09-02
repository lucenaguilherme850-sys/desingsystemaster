import { createServerFn } from "@tanstack/react-start";
import { requireVerifiedUser } from "@/lib/verified-auth";

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireVerifiedUser])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return false;
    return !!data;
  });

export async function assertAdmin(context: {
  supabase: { from: (t: string) => any };
  userId: string;
}): Promise<void> {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !data) {
    throw new Error("Forbidden: admin role required");
  }
}