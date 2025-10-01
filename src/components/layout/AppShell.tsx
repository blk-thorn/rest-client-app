import { Toaster } from "../../lib/ui/sonner";
import Footer from "./Footer";
import Header from "./Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gray-900 text-white">
      <Header />
      <main className="flex flex-col flex-1 bg-gray-900">{children}</main>
      <Toaster />
      <Footer />
    </div>
  );
}
