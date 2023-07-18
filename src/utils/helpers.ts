export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function raiseError(message: string): never {
  throw new Error(message);
}
