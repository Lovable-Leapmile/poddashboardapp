/**
 * Compatibility shim — the previous Sonner-based toaster has been
 * replaced by our own in-app notification system. This file keeps the
 * same export so `<Sonner />` mounts in App.tsx still work, but it
 * simply renders nothing (the real container is mounted via <Toaster />).
 */
export const Toaster = () => null;
export default Toaster;
