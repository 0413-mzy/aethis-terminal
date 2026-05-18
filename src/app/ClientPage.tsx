'use client';

import { useState, useEffect } from 'react';
import ClientApp from '@/components/ClientApp';

export function ClientPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0d0f12',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#c9a44b',
            fontSize: '18px',
            fontFamily: 'Georgia, serif',
          }}
        >
          ⚔️ 加载中...
        </span>
      </div>
    );
  }

  return <ClientApp />;
}
