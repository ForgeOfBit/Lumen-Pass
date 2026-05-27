import { useState } from 'react';
import {
  Pencil, Trash2, ShieldAlert, Copy, Eye, EyeOff,
  KeySquare, CreditCard, FileText, ShieldCheck, Fingerprint
} from 'lucide-react';
import type { VaultItem, ItemType } from '../hooks/useVault';

interface Props {
  item: VaultItem | null;
  onDelete: (id: string) => void;
  onEdit: (item: VaultItem) => void;
}

const TypeIcon = ({ type, size = 20 }: { type: ItemType; size?: number }) => {
  const icons = { login: KeySquare, card: CreditCard, note: FileText, totp: ShieldCheck, passkey: Fingerprint };
  const Icon = icons[type] ?? KeySquare;
  return <Icon size={size} strokeWidth={2} />;
};

const typeColorClass: Record<ItemType, string> = {
  login: 'type-login', card: 'type-card', note: 'type-note', totp: 'type-totp', passkey: 'type-passkey'
};

const badgeLabel: Record<ItemType, string> = {
  login: 'Şifre', card: 'Kart', note: 'Not', totp: '2FA / TOTP', passkey: 'Geçiş Anahtarı'
};

function CopyButton({ value, label = 'Kopyala' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      className="btn-icon"
      title={label}
      onClick={handleCopy}
      style={{ color: copied ? 'var(--apple-green)' : undefined }}
    >
      <Copy size={13} strokeWidth={2.5} />
    </button>
  );
}

function FieldRow({ label, value, mono = false, secret = false, copyable = true }: {
  label: string; value: string; mono?: boolean; secret?: boolean; copyable?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const displayValue = secret && !revealed ? '••••••••••' : value;

  return (
    <div className="field-group">
      <div className="field-label">{label}</div>
      <div className="field-value-row">
        <span className={`field-value ${mono ? 'mono' : ''}`} style={secret && !revealed ? { letterSpacing: '0.08em' } : {}}>
          {displayValue}
        </span>
        <div className="field-value-actions">
          {secret && (
            <button className="btn-icon" title={revealed ? 'Gizle' : 'Göster'} onClick={() => setRevealed(v => !v)}>
              {revealed ? <EyeOff size={13} strokeWidth={2.5} /> : <Eye size={13} strokeWidth={2.5} />}
            </button>
          )}
          {copyable && value && <CopyButton value={value} />}
        </div>
      </div>
    </div>
  );
}

function CreditCardWidget({ item }: { item: VaultItem }) {
  const raw = (item.cardNumber ?? '').replace(/\s/g, '');
  const formatted = raw.replace(/(.{4})/g, '$1 ').trim() || '•••• •••• •••• ••••';
  const isVisa = raw.startsWith('4');
  const isMC   = raw.startsWith('5');
  const cardClass = isVisa ? 'visa' : isMC ? 'mastercard' : 'generic';
  const brand = isVisa ? 'VISA' : isMC ? 'MASTERCARD' : 'CARD';

  return (
    <div className={`cc-card ${cardClass}`}>
      <div className="cc-top">
        <div className="cc-chip" />
        <div className="cc-brand-logo">{brand}</div>
      </div>
      <div className="cc-number">{formatted}</div>
      <div className="cc-bottom">
        <div className="cc-info">
          <div className="cc-info-label">Kart Sahibi</div>
          <div className="cc-info-value">{item.cardHolder || 'LUMEN USER'}</div>
        </div>
        <div className="cc-info" style={{ textAlign: 'right' }}>
          <div className="cc-info-label">Son Kullanma</div>
          <div className="cc-info-value">{item.cardExpiry || '00/00'}</div>
        </div>
      </div>
    </div>
  );
}

export function DetailPane({ item, onDelete, onEdit }: Props) {
  if (!item) {
    return (
      <main className="detail-pane">
        <div className="empty-state" style={{ height: '100%' }}>
          <ShieldAlert size={52} strokeWidth={1} style={{ opacity: 0.15 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
            Sıfır Bilgi Korumalı Kasa
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: 1.5, maxWidth: '260px' }}>
            Kimlik bilgilerini görüntülemek, güvenli not şifresini çözmek veya OTP kodu üretmek için bir öğe seçin.
          </p>
        </div>
      </main>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`"${item.title}" öğesini silmek istiyor musunuz?`)) onDelete(item.id);
  };

  return (
    <main className="detail-pane">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-brand-info">
          <div className={`detail-header-icon ${typeColorClass[item.type]}`}>
            <TypeIcon type={item.type} size={22} />
          </div>
          <div>
            <div className="detail-item-title">{item.title}</div>
            <span className={`detail-item-badge badge-${item.type}`}>
              {badgeLabel[item.type]}
            </span>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn-icon" title="Düzenle" onClick={() => onEdit(item)}>
            <Pencil size={15} strokeWidth={2} />
          </button>
          <button
            className="btn-icon"
            title="Sil"
            onClick={handleDelete}
            style={{ color: 'var(--apple-red)' }}
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="detail-scroll">
        {/* Login */}
        {item.type === 'login' && (
          <div className="detail-card">
            <div className="detail-card-header">
              <KeySquare size={13} strokeWidth={2} style={{ color: 'var(--c-login)' }} />
              <span className="detail-card-title">Giriş Bilgileri</span>
            </div>
            {item.username && <FieldRow label="Kullanıcı Adı / E-posta" value={item.username} />}
            {item.password && <FieldRow label="Şifre" value={item.password} mono secret />}
            {item.url && (
              <div className="field-group">
                <div className="field-label">Web Sitesi</div>
                <div className="field-value-row">
                  <a
                    href={item.url} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--apple-blue)', fontSize: '14px', textDecoration: 'none' }}
                  >
                    {item.url}
                  </a>
                  <div className="field-value-actions">
                    <CopyButton value={item.url} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Card */}
        {item.type === 'card' && (
          <>
            <CreditCardWidget item={item} />
            <div className="detail-card">
              <div className="detail-card-header">
                <CreditCard size={13} strokeWidth={2} style={{ color: 'var(--c-card)' }} />
                <span className="detail-card-title">Kart Bilgileri</span>
              </div>
              {item.cardNumber && <FieldRow label="Kart Numarası" value={item.cardNumber} mono />}
              {item.cardExpiry && <FieldRow label="Son Kullanma Tarihi" value={item.cardExpiry} />}
              {item.cardCvv    && <FieldRow label="CVV / Güvenlik Kodu" value={item.cardCvv} mono secret />}
              {item.cardHolder && <FieldRow label="Kart Sahibi" value={item.cardHolder} />}
            </div>
          </>
        )}

        {/* Note */}
        {item.type === 'note' && (
          <div className="detail-card">
            <div className="detail-card-header">
              <FileText size={13} strokeWidth={2} style={{ color: 'var(--c-note)' }} />
              <span className="detail-card-title">Şifreli Not</span>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <textarea
                readOnly
                value={item.noteContent || ''}
                style={{
                  width: '100%', minHeight: '180px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-sm)',
                  color: 'var(--text-primary)',
                  padding: '12px',
                  resize: 'vertical',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  lineHeight: 1.6,
                }}
              />
            </div>
          </div>
        )}

        {/* TOTP placeholder */}
        {item.type === 'totp' && (
          <div className="detail-card">
            <div className="detail-card-header">
              <ShieldCheck size={13} strokeWidth={2} style={{ color: 'var(--c-totp)' }} />
              <span className="detail-card-title">Kimlik Doğrulama Kodu</span>
            </div>
            <div className="totp-widget">
              <div className="totp-code">------</div>
            </div>
          </div>
        )}

        {/* Passkey placeholder */}
        {item.type === 'passkey' && (
          <div className="detail-card">
            <div className="detail-card-header">
              <Fingerprint size={13} strokeWidth={2} style={{ color: 'var(--c-passkey)' }} />
              <span className="detail-card-title">Geçiş Anahtarı</span>
            </div>
            {item.rpDomain   && <FieldRow label="Alan Adı" value={item.rpDomain} />}
            {item.usernameId && <FieldRow label="Kullanıcı" value={item.usernameId} />}
          </div>
        )}
      </div>
    </main>
  );
}
