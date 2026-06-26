import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Self-contained notification system.
 * No external toast library — works reliably in any hosting environment
 * (including sub-path deployments) because it renders into a single
 * portal we own and manage ourselves.
 */

export type NotificationVariant =
  | "default"
  | "success"
  | "error"
  | "info"
  | "warning"
  | "destructive";

export interface NotificationOptions {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: NotificationVariant;
  duration?: number; // ms
}

interface NotificationItem extends Required<Omit<NotificationOptions, "title" | "description">> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

type Listener = (items: NotificationItem[]) => void;

const DEFAULT_DURATION = 4000;
const MAX_VISIBLE = 5;

let items: NotificationItem[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const l of listeners) l(items);
}

function scheduleRemove(id: string, duration: number) {
  if (duration <= 0) return;
  const t = setTimeout(() => removeNotification(id), duration);
  timers.set(id, t);
}

export function removeNotification(id: string) {
  const t = timers.get(id);
  if (t) {
    clearTimeout(t);
    timers.delete(id);
  }
  items = items.filter((i) => i.id !== id);
  emit();
}

export function pushNotification(opts: NotificationOptions | string): string {
  const o: NotificationOptions = typeof opts === "string" ? { description: opts } : opts;
  const id = o.id ?? `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const item: NotificationItem = {
    id,
    title: o.title,
    description: o.description,
    variant: o.variant ?? "default",
    duration: o.duration ?? DEFAULT_DURATION,
  };
  // de-dupe by id
  items = [...items.filter((i) => i.id !== id), item].slice(-MAX_VISIBLE);
  emit();
  scheduleRemove(id, item.duration);
  return id;
}

/** Public API similar to sonner */
export const notify = Object.assign(
  (opts: NotificationOptions | string) => pushNotification(opts),
  {
    success: (msg: React.ReactNode, opts: NotificationOptions = {}) =>
      pushNotification({ ...opts, description: msg, variant: "success" }),
    error: (msg: React.ReactNode, opts: NotificationOptions = {}) =>
      pushNotification({ ...opts, description: msg, variant: "error" }),
    info: (msg: React.ReactNode, opts: NotificationOptions = {}) =>
      pushNotification({ ...opts, description: msg, variant: "info" }),
    warning: (msg: React.ReactNode, opts: NotificationOptions = {}) =>
      pushNotification({ ...opts, description: msg, variant: "warning" }),
    dismiss: (id?: string) => {
      if (id) removeNotification(id);
      else {
        items = [];
        timers.forEach((t) => clearTimeout(t));
        timers.clear();
        emit();
      }
    },
  }
);

function useNotifications() {
  const [list, setList] = React.useState<NotificationItem[]>(items);
  React.useEffect(() => {
    const l: Listener = (next) => setList([...next]);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return list;
}

const variantClasses: Record<NotificationVariant, string> = {
  default: "bg-background text-foreground border-border",
  success: "bg-green-600 text-white border-green-700",
  error: "bg-red-600 text-white border-red-700",
  destructive: "bg-red-600 text-white border-red-700",
  info: "bg-blue-600 text-white border-blue-700",
  warning: "bg-yellow-500 text-black border-yellow-600",
};

export const NotificationsContainer: React.FC = () => {
  const list = useNotifications();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-auto sm:max-w-sm"
      role="region"
      aria-label="Notifications"
    >
      {list.map((n) => (
        <div
          key={n.id}
          role="status"
          className={`pointer-events-auto relative flex items-start gap-3 rounded-md border shadow-lg px-4 py-3 animate-in slide-in-from-right-5 fade-in ${variantClasses[n.variant]}`}
        >
          <div className="flex-1 min-w-0">
            {n.title && (
              <div className="text-sm font-semibold leading-tight mb-0.5 break-words">
                {n.title}
              </div>
            )}
            {n.description && (
              <div className="text-sm leading-snug break-words">{n.description}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeNotification(n.id)}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default NotificationsContainer;
