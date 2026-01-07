import { getProfile } from "@/lib/actions/users";
import { ProfileContent } from "@/components/features/profile/ProfileContent";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const { success, data: user, error } = await getProfile();

  if (!success || !user) {
    if (error === "Authentication required") {
      redirect("/login");
    }
    // Handle other errors or show error state
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-red-500">
          Failed to load profile. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-12 md:pt-24 lg:pt-28">
      <ProfileContent user={user} />
    </main>
  );
}
