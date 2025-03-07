export function track(name: string, meta: Record<string, any>) {
  const prisch = (window as any).pirsch;
  if (!prisch) {
    console.error("Pirsch is not initialized. Ignoring event.", name, meta);
    return;
  }

  prisch(name, { meta });
}
