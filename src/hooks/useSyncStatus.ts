import { useState, useEffect } from 'react';

export interface SyncState {
  isSyncing: boolean;
  isEnriching: boolean;
  lastError: string | null;
  lastSuccess: string | null;
}

const BACKEND_URL = 'https://andromeda.nixlabs.tech';

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncState>({
    isSyncing: false,
    isEnriching: false,
    lastError: null,
    lastSuccess: null
  });

  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      es = new EventSource(`${BACKEND_URL}/api/sync/status`);
      
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setStatus(data);
        } catch (err) {
          console.error("Failed to parse sync status", err);
        }
      };

      es.onerror = () => {
        es?.close();
        // Retry connection after 5 seconds if SSE drops
        retryTimeout = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      es?.close();
      clearTimeout(retryTimeout);
    };
  }, []);

  return status;
}
