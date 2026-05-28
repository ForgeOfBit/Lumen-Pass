import { Search, Plus, Sparkles, KeySquare, CreditCard, FileText, ShieldCheck, Fingerprint } from 'lucide-react';
import type { VaultItem, ItemType } from '../hooks/useVault';

interface Props {
  items: VaultItem[];
  activeCategory: ItemType | 'all';
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedItem: VaultItem | null;
  setSelectedItem: (item: VaultItem) => void;
  onAddItem: () => void;
  onGeneratePassword: () => void;
}

const TypeIcon = ({ type }: { type: ItemType }) => {
  const icons = {
    login:   KeySquare,
    card:    CreditCard,
    note:    FileText,
    totp:    ShieldCheck,
    passkey: Fingerprint,
  };
  const Icon = icons[type] ?? KeySquare;
  return <Icon size={18} strokeWidth={2} />;
};

const categoryLabels: Record<ItemType | 'all', string> = {
  all:     'Tüm Öğeler',
  login:   'Şifreler',
  card:    'Kartlar',
  note:    'Notlar',
  totp:    '2FA / TOTP',
  passkey: 'Geçiş Anahtarları',
};

export function VaultList({
  items, activeCategory, searchQuery, setSearchQuery,
  selectedItem, setSelectedItem, onAddItem, onGeneratePassword
}: Props) {
  const filtered = items.filter(item => {
    const matchCat = activeCategory === 'all' || item.type === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchQuery = !q ||
      item.title.toLowerCase().includes(q) ||
      (item.username ?? '').toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const getSubtitle = (item: VaultItem) => {
    if (item.type === 'login')   return item.username || '–';
    if (item.type === 'card')    return item.cardNumber ? `•••• ${item.cardNumber.replace(/\s/g,'').slice(-4)}` : '–';
    if (item.type === 'note')    return item.noteContent ? item.noteContent.slice(0, 26) + '…' : '–';
    if (item.type === 'totp')    return item.issuer || 'Kimlik Doğrulayıcı';
    if (item.type === 'passkey') return item.rpId || 'Yerel Anahtar';
    return '';
  };

  return (
    <section className="list-pane">
      {/* Header */}
      <div className="list-header">
        <div className="list-title-row">
          <span className="list-title">{categoryLabels[activeCategory]}</span>
          <div className="list-actions">
            <button className="btn-icon" title="Yeni Öğe Ekle" onClick={onAddItem}>
              <Plus size={16} strokeWidth={2.5} />
            </button>
            <button className="btn-icon" title="Şifre Oluştur" onClick={onGeneratePassword}>
              <Sparkles size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar">
          <Search className="search-icon" size={14} strokeWidth={2} />
          <input
            type="text"
            placeholder="Kasada ara…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="vault-list-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={40} strokeWidth={1.2} />
            <p>
              {searchQuery
                ? 'Aramanızla eşleşen öğe bulunamadı.'
                : 'Bu kategoride henüz öğe yok.\n+ butonuna tıklayarak başlayın.'}
            </p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className={`vault-item type-${item.type} ${selectedItem?.id === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="item-icon">
                <TypeIcon type={item.type} />
              </div>
              <div className="item-content">
                <div className="item-title">{item.title}</div>
                <div className="item-subtitle">{getSubtitle(item)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
