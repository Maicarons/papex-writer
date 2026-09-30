import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Shell } from "@/shell/Shell";
import { WelcomePage } from "@/features/welcome/WelcomePage";

export default function App() {
  const view = useApp((s) => s.view);
  const loadRecents = useApp((s) => s.loadRecents);
  const openProject = useApp((s) => s.openProject);

  React.useEffect(() => {
    void loadRecents();
  }, [loadRecents]);

  // Test/automation bridge + optional --project= auto-open
  React.useEffect(() => {
    const g = window as unknown as {
      __papexApp?: unknown;
      writer?: unknown;
    };
    g.__papexApp = {
      getState: () => {
        const s = useApp.getState();
        return {
          view: s.view,
          root: s.root,
          dirty: s.dirty,
          status: s.status,
          activeSection: s.activeSection,
          editorMode: s.editorMode,
          sections: s.manifest.sections.map((x) => x.title ?? x.file),
          ideas: s.writer.ideas.length,
          refs: s.manifest.references?.length ?? 0,
          compileOk: s.compile.ok,
          compileErrors: s.compile.errors.length,
        };
      },
      openProject: (root?: string) => useApp.getState().openProject(root),
      createProject: (root?: string) => useApp.getState().createProject(root),
      createSample: () => useApp.getState().createFromTemplate("sample"),
      setView: (v: string) => useApp.getState().setView(v as never),
      setEditorMode: (m: string) => useApp.getState().setEditorMode(m as never),
      runCompile: () => useApp.getState().runCompile(),
      exportArchive: () => useApp.getState().exportArchive(),
      saveProject: () => useApp.getState().saveProject(),
    };

    // auto-open project from env/argv (used by e2e and CLI)
    const envDir = (window as unknown as { process?: { env?: Record<string, string> } }).process?.env
      ?.PAPEX_E2E_PROJECT;
    const search = window.location.search;
    const q = new URLSearchParams(search);
    const dir = q.get("project") || envDir;
    if (dir) {
      void openProject(dir);
    }
    window.writer?.onAutoProject?.((d) => {
      void openProject(d);
    });
  }, [openProject]);

  return view === "welcome" ? <WelcomePage /> : <Shell />;
}
