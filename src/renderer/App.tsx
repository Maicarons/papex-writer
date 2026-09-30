import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Shell } from "@/shell/Shell";
import { WelcomePage } from "@/features/welcome/WelcomePage";

export default function App() {
  const ready = useApp((s) => s.ready);
  const view = useApp((s) => s.view);
  const loadRecents = useApp((s) => s.loadRecents);

  React.useEffect(() => {
    void loadRecents();
  }, [loadRecents]);

  if (!ready && view === "welcome") {
    // still render welcome; ready flips after recents load
  }

  return view === "welcome" ? <WelcomePage /> : <Shell />;
}
