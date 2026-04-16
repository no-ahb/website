const base = import.meta.env.BASE_URL;
export function asset(path: string): string {
  return path.startsWith('/') ? `${base}${path.slice(1)}` : path;
}
