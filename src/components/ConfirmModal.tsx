import { useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open, title, message, confirmText = 'Onayla', cancelText = 'İptal',
  danger = true, onConfirm, onCancel
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 150ms ease both',
      }}
    >
      <div style={{
        width: '100%', maxWidth: '360px',
        background: 'rgba(30, 30, 32, 0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 'var(--r-xl)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        animation: 'slideUp 250ms cubic-bezier(0.34,1.56,0.64,1) both',
        margin: '0 16px',
        overflow: 'hidden',
      }}>
        {/* Body */}
        <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: danger ? 'rgba(255,69,58,0.15)' : 'rgba(50,215,75,0.15)',
            color: danger ? 'var(--apple-red)' : 'var(--apple-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <AlertTriangle size={22} strokeWidth={2.5} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
            {title}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
          padding: '16px', background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={onCancel}
            className="button button-secondary"
            style={{ padding: '10px', fontSize: '13px', fontWeight: 500, textAlign: 'center', justifyContent: 'center' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              background: danger ? 'var(--apple-red)' : 'var(--apple-blue)',
              color: '#fff', border: 'none', borderRadius: 'var(--r-sm)',
              padding: '10px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'filter 120ms',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
