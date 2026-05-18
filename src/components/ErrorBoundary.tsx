'use client';

import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0d0f12', color: '#e8e0d3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', padding: '2rem',
        }}>
          <div style={{ maxWidth: 600, background: '#161a22', border: '1px solid #8b3a3a', borderRadius: 12, padding: 24 }}>
            <h2 style={{ color: '#c0392b', marginBottom: 12 }}>运行时错误</h2>
            <pre style={{
              background: '#0d0f12', color: '#ff4444', padding: 16, borderRadius: 8,
              fontSize: 13, overflow: 'auto', maxHeight: 400, whiteSpace: 'pre-wrap',
            }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
