export function makeMessage(type: string, data: any) {
  return JSON.stringify({ type, data });
}
