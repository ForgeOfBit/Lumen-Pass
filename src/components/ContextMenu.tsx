import { useEffect, useRef } from 'react';
import { Pencil, Trash2, Copy, Lock, KeySquare, FileText, CreditCard } from 'lucide-react';
import type { VaultItem } from '../hooks/useVault';

interface Props {
  x: number;
  y: number;
  item?: VaultItem | null; // if null, it's a global context menu
  onClose: () => void;
  // Item actions
  onEdit?: (item: VaultItem) => void;
  onDeleteRequest?: (item: VaultItem) => void;
  // Global actions
  onAddLogin?: () => void;
  onAddNote?: () => void;
  onAddCard?: () => void;
  onLockVault?: () => void;
}

export function ContextMenu({
  x, y, item, onClose,
  onEdit, onDeleteRequest,
  onAddLogin, onAddNote, onAddCard, onLockVault
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    // Also close on right click outside
    document.addEventListener('contextmenu', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('contextmenu', handleClick);
    };
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(y, window.innerHeight - (item ? 180 : 200)),
    left: Math.min(x, window.innerWidth - 200),
    zIndex: 1000,
    background: 'rgba(30, 30, 32, 0.85)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    padding: '6px',
    minWidth: '180px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    animation: 'menuFadeIn 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  const handleEdit = () => {
    if (item && onEdit) onEdit(item);
    onClose();
  };

  const handleDelete = () => {
    if (item && onDeleteRequest) onDeleteRequest(item);
    onClose();
  };



  const handleCopyField = (val?: string) => {
    if (val) navigator.clipboard.writeText(val);
    onClose();
  };

  const executeAndClose = (fn?: () => void) => () => {
    if (fn) fn();
    onClose();
  };

  return (
    <div ref={menuRef} style={style} onContextMenu={(e) => e.preventDefault()}>
      <style>{`
        @keyframes menuFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .context-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          background: transparent;
          border: none;
          text-align: left;
          width: 100%;
          transition: background 100ms;
        }
        .context-menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .context-menu-item.danger {
          color: var(--apple-red);
        }
        .context-menu-item.danger:hover {
          background: rgba(255, 69, 58, 0.15);
        }
        .context-menu-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 4px 6px;
        }
      `}</style>

      {item ? (
        /* --- Item-Specific Actions --- */
        <>
          {item.type === 'login' && item.username && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.username)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>Kullanıcı Adını Kopyala</span>
            </button>
          )}
          {item.type === 'login' && item.password && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.password)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>Şifreyi Kopyala</span>
            </button>
          )}
          {item.type === 'login' && (item.urls?.[0] || item.url) && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.urls?.[0] || item.url)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>URL'yi Kopyala</span>
            </button>
          )}

          {item.type === 'card' && item.cardNumber && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.cardNumber)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>Kart Numarasını Kopyala</span>
            </button>
          )}
          {item.type === 'card' && item.cardCvv && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.cardCvv)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>CVV Kodunu Kopyala</span>
            </button>
          )}
          {item.type === 'card' && item.cardExpiry && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.cardExpiry)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>Son Kullanma Tarihini Kopyala</span>
            </button>
          )}
          {item.type === 'card' && item.cardHolder && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.cardHolder)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>Kart Sahibini Kopyala</span>
            </button>
          )}

          {item.type === 'note' && item.noteContent && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.noteContent)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>Notu Kopyala</span>
            </button>
          )}

          {item.type === 'totp' && item.totpSecret && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.totpSecret)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>Gizli Anahtarı Kopyala</span>
            </button>
          )}
          {item.type === 'totp' && item.issuer && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.issuer)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>Hizmet Adını Kopyala</span>
            </button>
          )}

          {item.type === 'passkey' && item.passkeyUsername && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.passkeyUsername)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>Kullanıcı Adını Kopyala</span>
            </button>
          )}
          {item.type === 'passkey' && item.rpId && (
            <button className="context-menu-item" onClick={() => handleCopyField(item.rpId)}>
              <Copy size={14} style={{ opacity: 0.7 }} />
              <span>Alan Adını (Domain) Kopyala</span>
            </button>
          )}

          <div className="context-menu-divider" />

          <button className="context-menu-item" onClick={handleEdit}>
            <Pencil size={14} style={{ opacity: 0.7 }} />
            <span>Düzenle</span>
          </button>
          
          <div className="context-menu-divider" />
          
          <button className="context-menu-item danger" onClick={handleDelete}>
            <Trash2 size={14} style={{ opacity: 0.7 }} />
            <span>Sil</span>
          </button>
        </>
      ) : (
        /* --- Global Actions --- */
        <>
          <button className="context-menu-item" onClick={executeAndClose(onAddLogin)}>
            <KeySquare size={14} style={{ opacity: 0.7, color: 'var(--c-login)' }} />
            <span>Yeni Şifre Ekle</span>
          </button>
          <button className="context-menu-item" onClick={executeAndClose(onAddCard)}>
            <CreditCard size={14} style={{ opacity: 0.7, color: 'var(--c-card)' }} />
            <span>Yeni Kart Ekle</span>
          </button>
          <button className="context-menu-item" onClick={executeAndClose(onAddNote)}>
            <FileText size={14} style={{ opacity: 0.7, color: 'var(--c-note)' }} />
            <span>Yeni Not Ekle</span>
          </button>
          <div className="context-menu-divider" />
          <button className="context-menu-item" onClick={executeAndClose(onLockVault)}>
            <Lock size={14} style={{ opacity: 0.7 }} />
            <span>Kasayı Kilitle</span>
          </button>
        </>
      )}
    </div>
  );
}
