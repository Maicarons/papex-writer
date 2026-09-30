import * as React from "react";
import { cn } from "@/lib/cn";

/** Vertical activity bar (Overleaf rail / VS Code style). */
export function ActivityRail({
  items,
  activeId,
  onSelect,
}: {
  items: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav
      className="flex h-full w-[56px] shrink-0 flex-col items-center gap-1 border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))] py-2"
      aria-label="主导航"
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            onClick={() => onSelect(item.id)}
            className={cn(
              "group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
              active
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
            )}
          >
            <item.icon className="h-[18px] w-[18px]" aria-hidden />
            {item.badge != null && item.badge > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] px-1 text-[9px] font-semibold text-[hsl(var(--primary-foreground))]">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
            <span
              className={cn(
                "absolute left-0 h-6 w-[3px] rounded-r-full bg-[hsl(var(--primary))] transition-opacity duration-200",
                active ? "opacity-100" : "opacity-0",
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </nav>
  );
}

/** Resizable side panel with collapse toggle. */
export function SidePanel({
  title,
  width,
  onWidthChange,
  collapsed,
  onToggleCollapse,
  children,
  actions,
}: {
  title: string;
  width: number;
  onWidthChange: (w: number) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const dragging = React.useRef(false);
  const startX = React.useRef(0);
  const startW = React.useRef(width);

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const next = Math.min(420, Math.max(220, startW.current + (e.clientX - startX.current)));
      onWidthChange(next);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onWidthChange]);

  if (collapsed) {
    return (
      <div className="flex w-0 shrink-0 overflow-hidden border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="展开侧栏"
          title="展开侧栏"
          className="h-full w-2 cursor-pointer bg-[hsl(var(--muted))] transition-colors hover:bg-[hsl(var(--accent))]"
        />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-0 shrink-0 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]"
      style={{ width }}
    >
      <header className="flex h-10 shrink-0 items-center gap-2 border-b border-[hsl(var(--border))] px-3">
        <span className="flex-1 truncate text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          {title}
        </span>
        {actions}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="折叠侧栏"
          title="折叠侧栏"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      <div
        role="separator"
        aria-orientation="vertical"
        className="h-1 w-full cursor-col-resize bg-transparent transition-colors hover:bg-[hsl(var(--primary)/0.35)]"
        onMouseDown={(e) => {
          dragging.current = true;
          startX.current = e.clientX;
          startW.current = width;
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";
        }}
      />
    </div>
  );
}

/** Compact list row used in context panels. */
export function PanelRow({
  active,
  onClick,
  title,
  meta,
  icon: Icon,
}: {
  active?: boolean;
  onClick?: () => void;
  title: string;
  meta?: string;
  icon?: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
        active
          ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
          : "hover:bg-[hsl(var(--muted))]",
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" aria-hidden /> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] leading-tight">{title}</span>
        {meta ? (
          <span className="block truncate text-[11px] text-[hsl(var(--muted-foreground))]">{meta}</span>
        ) : null}
      </span>
    </button>
  );
}
