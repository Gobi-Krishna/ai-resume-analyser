export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k: number = 1024;
  const sizes: string[] = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i: number = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export const generateUUID = () => crypto.randomUUID();
