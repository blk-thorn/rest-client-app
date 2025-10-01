"use client";

import WelcomeMessage from "@/components/WelcomeMessage";
import GeneralInfo from "@/components/GeneraInfo";
import { UserButtons } from "@/components/ui/UserButtons";
import Loader from "@/components/ui/Loader";
import { useAuthToken } from "@/lib/hooks/useAuthToken";

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
