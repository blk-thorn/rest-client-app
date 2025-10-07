"use client";

import WelcomeMessage from "@/components/onboarding/welcome-message";
import GeneralInfo from "@/components/onboarding/general-info";
import { UserButtons } from "@/components/ui/user-buttons";
import Loader from "@/components/ui/loader";
import { useAuthToken } from "@/lib/hooks/use-auth-token";

export default function HomePage() {
  const { user, loading } = useAuthToken();

  if (loading) return <Loader />;

  const isAuthenticated = !!user;
  const username = user?.displayName || "Jacob Schmidt";

  return (
    <div className="flex flex-col flex-1 p-6 gap-12">
      <div className="flex flex-col items-center gap-6">
        <WelcomeMessage isAuthenticated={isAuthenticated} username={username} />
        {isAuthenticated && <UserButtons />}
      </div>
      <GeneralInfo />
    </div>
  );
}
