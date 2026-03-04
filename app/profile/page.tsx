import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/currentUser";
import { getOrCreateUserProfile } from "@/lib/social";

export default async function ProfileRedirectPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/dashboard");
  }

  const profile = await getOrCreateUserProfile(userId);
  redirect(`/users/${encodeURIComponent(profile.username)}`);
}
