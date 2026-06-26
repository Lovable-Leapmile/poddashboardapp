/**
 * Legacy `useToast` hook — now backed by our custom in-app notification
 * system (see `src/components/ui/notifications.tsx`). The previous Radix
 * based implementation could fail in some hosted environments; this
 * replacement keeps the same API so existing call sites work unchanged.
 */
import * as React from "react";
import {
  notify,
  pushNotification,
  removeNotification,
  type NotificationOptions,
  type NotificationVariant,
} from "@/components/ui/notifications";

type ToastVariant = "default" | "destructive" | NotificationVariant;

export interface ToastInput {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

function toToast(input: ToastInput | string): NotificationOptions {
  if (typeof input === "string") return { description: input };
  const variant: NotificationVariant =
    input.variant === "destructive" ? "error" : (input.variant as NotificationVariant) || "default";
  return {
    id: input.id,
    title: input.title,
    description: input.description,
    variant,
    duration: input.duration,
  };
}

export function toast(input: ToastInput | string) {
  const id = pushNotification(toToast(input));
  return {
    id,
    dismiss: () => removeNotification(id),
    update: (next: ToastInput) => pushNotification({ ...toToast(next), id }),
  };
}

export function useToast() {
  return {
    toast,
    dismiss: (id?: string) => notify.dismiss(id),
    toasts: [] as Array<{ id: string }>,
  };
}

export default useToast;
