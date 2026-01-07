export function track(name: string, meta: Record<string, any>) {
  (window as any)?.datafast?.(name, meta);
}
