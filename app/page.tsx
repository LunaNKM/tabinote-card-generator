import { AppHeader } from "@/components/layout/AppHeader";
import { LeftPanel } from "@/components/layout/LeftPanel";
import { PreviewPanel } from "@/components/layout/PreviewPanel";

export default function HomePage() {
  return (
    <main>
      <AppHeader />
      <div className="flex min-h-screen pt-14">
        <LeftPanel />
        <PreviewPanel />
      </div>
    </main>
  );
}
