import { useEffect, useState, type ComponentType } from "react";

import { modules as discoveredModules } from "./.generated/mockup-components";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) {
          return;
        }
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) {
          setError(
            `No exported React component found in ${componentPath}.tsx\n\nMake sure the file has at least one exported function component.`,
          );
          return;
        }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) {
          return;
        }

        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to load preview.\n${message}`);
      }
    }

    void loadComponent();

    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <pre style={{ color: "red", padding: "2rem", fontFamily: "system-ui" }}>
        {error}
      </pre>
    );
  }

  if (!Component) return null;

  return <Component />;
}

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getDiscoveredComponentPaths(modules: ModuleMap): string[] {
  return Object.keys(modules)
    .map((key) =>
      key.replace(/^\.\/components\/mockups\//, "").replace(/\.tsx$/, ""),
    )
    .sort();
}

function Gallery({ modules }: { modules: ModuleMap }) {
  const basePath = getBasePath();
  const componentPaths = getDiscoveredComponentPaths(modules);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Component Preview Server
        </h1>
        <p className="text-gray-500 mb-4">
          This server renders individual components for the workspace canvas.
        </p>

        {componentPaths.length > 0 ? (
          <ul className="text-left text-sm bg-white rounded border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {componentPaths.map((componentPath) => (
              <li key={componentPath}>
                <a
                  href={`${basePath}/preview/${componentPath}`}
                  className="block px-3 py-2 text-blue-600 hover:bg-gray-50"
                >
                  {componentPath}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">
            No components found yet. Add one under{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
              src/components/mockups/
            </code>{" "}
            and it will show up here automatically.
          </p>
        )}
      </div>
    </div>
  );
}

function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

function App() {
  const previewPath = getPreviewPath();
  const currentPath = previewPath || "Project2Anniversary";
  const basePath = getBasePath();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Project Switcher Navigation */}
      <header className="bg-rose-950/90 text-amber-200 border-b border-amber-400/30 px-4 py-2 flex items-center justify-between z-50 text-xs font-sans shadow-md backdrop-blur">
        <div className="flex items-center gap-2 font-bold tracking-wider">
          <span className="text-amber-400 text-sm">🎁 GOODIES PROJECTS</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`${basePath}/preview/Project1Goodies`}
            className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 border ${
              currentPath === "Project1Goodies"
                ? "bg-amber-400 text-rose-950 border-amber-200 shadow"
                : "bg-rose-900/60 text-amber-200 border-amber-400/30 hover:bg-rose-900"
            }`}
          >
            <span>📦 Project 1 (Hardcoded Goodies)</span>
          </a>

          <a
            href={`${basePath}/preview/Project2Anniversary`}
            className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 border ${
              currentPath === "Project2Anniversary"
                ? "bg-amber-400 text-rose-950 border-amber-200 shadow"
                : "bg-rose-900/60 text-amber-200 border-amber-400/30 hover:bg-rose-900"
            }`}
          >
            <span>💍 Project 2 (2 Year Anniversary - Edit Mode)</span>
          </a>
        </div>
      </header>

      {/* Component Renderer */}
      <main className="flex-1">
        <PreviewRenderer
          componentPath={currentPath}
          modules={discoveredModules}
        />
      </main>
    </div>
  );
}

export default App;
