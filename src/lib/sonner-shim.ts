/**
 * Drop-in replacement for the `sonner` package.
 * Aliased in vite.config.ts so existing `import { toast } from "sonner"`
 * calls keep working but route through our own notification system.
 */
import { notify, NotificationsContainer } from "@/components/ui/notifications";

export const toast = notify;
export const Toaster = NotificationsContainer;
export default toast;
