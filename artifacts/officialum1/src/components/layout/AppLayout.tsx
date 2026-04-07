import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
        {/* Mobile bottom nav spacer */}
        <div className="lg:hidden" style={{ height: "calc(60px + env(safe-area-inset-bottom, 0px))" }} />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
