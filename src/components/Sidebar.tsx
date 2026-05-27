import { LayoutGrid, KeySquare, CreditCard, FileText, ShieldCheck, Fingerprint, Lock } from 'lucide-react';
import type { ItemType, VaultItem } from '../hooks/useVault';

interface Props {
  activeCategory: ItemType | 'all';
  setActiveCategory: (cat: ItemType | 'all') => void;
  onLock: () => void;
  items: VaultItem[];
}

const navItems = [
  { id: 'all'     as const, icon: LayoutGrid,  label: 'Tüm Öğeler' },
  { id: 'login'   as const, icon: KeySquare,   label: 'Şifreler'   },
  { id: 'card'    as const, icon: CreditCard,  label: 'Kartlar'    },
  { id: 'note'    as const, icon: FileText,    label: 'Notlar'     },
  { id: 'totp'    as const, icon: ShieldCheck, label: '2FA / TOTP' },
  { id: 'passkey' as const, icon: Fingerprint, label: 'Geçiş Anahtarları' },
];

export function Sidebar({ activeCategory, setActiveCategory, onLock, items }: Props) {
  const countFor = (cat: ItemType | 'all') =>
    cat === 'all' ? items.length : items.filter(i => i.type === cat).length;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-logo">LP</div>
        <div className="brand-info">
          <div className="brand-name">LumenPass</div>
          <div className="vault-status-pill">
            <span className="vault-status-dot" />
            Şifresi çözüldü
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-section">
        <div className="nav-section-label">Kasa</div>

        {navItems.map(({ id, icon: Icon, label }) => {
          const count = countFor(id as ItemType | 'all');
          return (
            <div
              key={id}
              className={`nav-item ${activeCategory === id ? 'active' : ''}`}
              data-cat={id}
              onClick={() => setActiveCategory(id)}
            >
              <span className="nav-item-icon">
                <Icon size={15} strokeWidth={2} />
              </span>
              {label}
              {count > 0 && (
                <span className="nav-item-count">{count}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="btn-lock" onClick={onLock}>
          <Lock size={14} strokeWidth={2} />
          Kasayı Kilitle
        </button>
      </div>
    </aside>
  );
}
