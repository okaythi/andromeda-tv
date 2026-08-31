import { useEffect, useState } from 'react';
import { apiUrl } from '../api/client';

export interface SyncState {
  isSyncing: boolean;
  isEnriching: boolean;
  lastError: string | null;
  lastSuccess: string | null;
}

const INITIAL_STATUS: SyncState = {
  isSyncing: false,
  isEnriching: false,
  lastError: null,
  lastSuccess: null,
};

export function useSyncStatus(): SyncState {
  const [status, setStatus] = useState<SyncState>(INITIAL_STATUS);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof window.setTimeout> | null = null;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      eventSource = new EventSource(apiUrl('/api/sync/status'));
      eventSource.onmessage = (event) => {
        try {
          const payload: unknown = JSON.parse(event.data);
          if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return;
          const record = payload as Record<string, unknown>;
          if (
            typeof record['isSyncing'] !== 'boolean'
            || typeof record['isEnriching'] !== 'boolean'
            || (record['lastError'] !== null && typeof record['lastError'] !== 'string')
            || (record['lastSuccess'] !== null && typeof record['lastSuccess'] !== 'string')
          ) return;

          setStatus({
            isSyncing: record['isSyncing'],
            isEnriching: record['isEnriching'],
            lastError: record['lastError'],
            lastSuccess: record['lastSuccess'],
          });
        } catch {
          // Keep the last known status when an invalid SSE message arrives.
        }
      };
      eventSource.onerror = () => {
        eventSource?.close();
        retryTimeout = window.setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      disposed = true;
      eventSource?.close();
      if (retryTimeout !== null) window.clearTimeout(retryTimeout);
    };
  }, []);

  return status;
}
