export function parseError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
