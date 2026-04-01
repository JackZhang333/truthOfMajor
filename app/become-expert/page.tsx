import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BecomeExpertForm } from "./become-expert-form";

export default async function BecomeExpertPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=%2Fbecome-expert");
  }

  const { data: expert } = await supabase
    .from("experts")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (expert?.status === "approved") {
    redirect("/dashboard");
  }

  if (expert?.status === "pending") {
    redirect("/dashboard");
  }

  return <BecomeExpertForm userId={user.id} />;
}
