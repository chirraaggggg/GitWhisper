const requestMap = new Map<string, number>();

export function isRateLimited(key: string, windowMs: number): boolean {
  const now = Date.now();
  const lastRequest = requestMap.get(key);
  
  if(lastRequest && now - lastRequest < windowMs) {
    return true;
  }
  
  requestMap.set(key, now);
  return false;
}