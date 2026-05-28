import {StrictMode, Component, ReactNode, ErrorInfo} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean; error: Error | null };

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#ff4444', background: '#111', zIndex: 99999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Surgió un error inesperado (Error de Código)</h1>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '14px', background: '#222', padding: 20 }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px', opacity: 0.7 }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (err: any) {
  const el = document.getElementById('error-log');
  if (el) {
    el.style.display = 'block';
    el.innerHTML += '<b>Startup error:</b> ' + String(err.message) + '<br><br>';
  }
}
