import { useState, useCallback } from 'react';

export const useRateLimit = (limit: number, intervalMs: number) => {
  const [requests, setRequests] = useState<number[]>([]);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const recentRequests = requests.filter(time => now - time < intervalMs);
    
    if (recentRequests.length < limit) {
      setRequests([...recentRequests, now]);
      return true;
    }
    
    return false;
  }, [requests, limit, intervalMs]);

  const getTimeToNextRequest = useCallback(() => {
    if (requests.length === 0) return 0;
    const now = Date.now();
    const oldestRequest = requests[0];
    const timeToWait = intervalMs - (now - oldestRequest);
    return Math.max(0, timeToWait);
  }, [requests, intervalMs]);

  return {
    checkRateLimit,
    getTimeToNextRequest,
    isLimited: requests.length >= limit,
  };
};
