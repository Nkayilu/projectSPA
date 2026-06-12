import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Log initial page load details from main.jsx
window.logApp('Initialisation de main.jsx');

// Class Component Error Boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    window.logApp(`💥 React Error Boundary capturé: ${error.message}`, error.stack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          background: '#0B1528',
          color: '#F8FAFC',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            background: '#1E293B',
            borderRadius: '16px',
            border: '1px solid #EF4444',
            padding: '24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px' }}>🚨</span>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 850, margin: 0, color: '#EF4444' }}>
                  Erreur de rendu détectée
                </h1>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0' }}>
                  L'application a rencontré un problème critique sur cet appareil.
                </p>
              </div>
            </div>

            <div style={{
              background: '#0F172A',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              borderLeft: '4px solid #EF4444',
              overflowX: 'auto'
            }}>
              <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px', color: '#FDA4AF' }}>
                Détails de l'erreur :
              </strong>
              <code style={{ fontSize: '12px', color: '#F1F5F9', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {this.state.error && this.state.error.toString()}
              </code>
            </div>

            {this.state.errorInfo && (
              <details style={{ marginBottom: '16px' }}>
                <summary style={{ fontSize: '13px', color: '#38BDF8', cursor: 'pointer', outline: 'none' }}>
                  Afficher la pile d'exécution (Stack Trace)
                </summary>
                <pre style={{
                  background: '#0F172A',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#94A3B8',
                  overflowX: 'auto',
                  marginTop: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={{ borderTop: '1px solid #334155', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '14px', margin: '0 0 10px 0', color: '#94A3B8' }}>
                Logs de diagnostic système :
              </h3>
              <div style={{
                background: '#0F172A',
                borderRadius: '8px',
                padding: '10px',
                maxHeight: '150px',
                overflowY: 'auto',
                fontSize: '11px',
                fontFamily: 'monospace',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {window.appLogs.map((log, index) => (
                  <div key={index} style={{ borderBottom: '1px solid #1E293B', paddingBottom: '4px' }}>
                    <span style={{ color: '#38BDF8' }}>[{log.timestamp}]</span>{' '}
                    <span style={{ color: '#F1F5F9' }}>{log.message}</span>
                    {log.data && (
                      <div style={{ color: '#94A3B8', fontSize: '10px', paddingLeft: '8px', marginTop: '2px' }}>
                        {log.data}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  background: '#EF4444',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Recharger la page
              </button>
              <button 
                onClick={() => {
                  // Clean storage in case of corrupted user session
                  localStorage.clear();
                  window.location.href = window.location.origin;
                }}
                style={{
                  background: '#334155',
                  color: '#E2E8F0',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Réinitialiser la session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

