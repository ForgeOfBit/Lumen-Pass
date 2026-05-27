import { useState, useEffect, useRef } from 'react';
import {
  X, KeySquare, CreditCard, FileText, ShieldCheck, Fingerprint,
  Eye, EyeOff, RefreshCw, Sparkles
} from 'lucide-react';
import type { VaultItem, ItemType } from '../hooks/useVault';
import { generateSecurePassword, checkPasswordStrength, DEFAULT_GEN_OPTIONS } from '../utils/generator';

/* ─── Types ─────────────────────────────────────────────── */

interface Props {
  open: boolean;
  editItem?: VaultItem | null;
  defaultType?: ItemType;
  onClose: () => void;
  onSave: (item: VaultItem) => Promise<void>;
}

/* ─── Constants ─────────────────────────────────────────── */

const ITEM_TYPES: { id: ItemType; label: string; icon: typeof KeySquare; color: string }[] = [
  { id: 'login',   label: 'Şifre',              icon: KeySquare,   color: 'var(--c-login)'   },
  { id: 'card',    label: 'Kart',               icon: CreditCard,  color: 'var(--c-card)'    },
  { id: 'note',    label: 'Not',                icon: FileText,    color: 'var(--c-note)'    },
  { id: 'totp',    label: '2FA / TOTP',         icon: ShieldCheck, color: 'var(--c-totp)'    },
  { id: 'passkey', label: 'Geçiş Anahtarı',     icon: Fingerprint, color: 'var(--c-passkey)' },
];

const STRENGTH_LABELS = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];
const STRENGTH_COLORS = ['', 'var(--apple-red)', 'var(--apple-orange)', 'var(--apple-yellow)', 'var(--apple-green)'];

/* ─── Sub-components ─────────────────────────────────────── */

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function PasswordInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [genOpts, setGenOpts] = useState(DEFAULT_GEN_OPTIONS);
  const [generated, setGenerated] = useState('');
  const strength = checkPasswordStrength(value);

  const regenerate = () => {
    setGenerated(generateSecurePassword(genOpts));
  };

  useEffect(() => {
    if (genOpen) regenerate();
  }, [genOpen, genOpts]);

  const useGenerated = () => {
    onChange(generated);
    setGenOpen(false);
  };

  return (
    <div>
      {/* Input row */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Şifre girin veya oluşturun"
          style={{ paddingRight: '72px' }}
        />
        <div style={{ position: 'absolute', right: '4px', display: 'flex', gap: '2px' }}>
          <button type="button" className="btn-icon" onClick={() => setShow(v => !v)} title={show ? 'Gizle' : 'Göster'} style={{ width: '28px', height: '28px' }}>
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button type="button" className="btn-icon" onClick={() => setGenOpen(v => !v)} title="Şifre Oluştur" style={{ width: '28px', height: '28px', color: genOpen ? 'var(--apple-blue)' : undefined }}>
            <Sparkles size={13} />
          </button>
        </div>
      </div>

      {/* Strength meter */}
      {value && (
        <div style={{ marginTop: '6px' }}>
          <div className={`strength-meter strength-score-${strength}`}>
            <div className="strength-bar bar-1" />
            <div className="strength-bar bar-2" />
            <div className="strength-bar bar-3" />
            <div className="strength-bar bar-4" />
          </div>
          <span style={{ fontSize: '10px', color: STRENGTH_COLORS[strength], fontWeight: 600, marginTop: '3px', display: 'block' }}>
            {STRENGTH_LABELS[strength]}
          </span>
        </div>
      )}

      {/* Password generator panel */}
      {genOpen && (
        <div style={{
          marginTop: '10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-md)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {/* Generated preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <code style={{
              flex: 1, fontFamily: 'var(--font-mono)', fontSize: '13px',
              color: 'var(--apple-cyan)', background: 'rgba(0,0,0,0.3)',
              padding: '8px 12px', borderRadius: 'var(--r-sm)',
              wordBreak: 'break-all', lineHeight: 1.4,
            }}>
              {generated}
            </code>
            <button type="button" className="btn-icon" onClick={regenerate} title="Yenile">
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Length slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>Uzunluk</span>
            <input
              type="range" min={8} max={64}
              value={genOpts.length}
              onChange={e => setGenOpts(o => ({ ...o, length: +e.target.value }))}
              style={{ flex: 1, accentColor: 'var(--apple-blue)', height: '3px' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', width: '24px', textAlign: 'right' }}>
              {genOpts.length}
            </span>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {([
              ['upper', 'A–Z Büyük'],
              ['lower', 'a–z Küçük'],
              ['nums',  '0–9 Sayı'],
              ['syms',  '!@# Sembol'],
            ] as const).map(([key, lbl]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={genOpts[key]}
                  onChange={e => setGenOpts(o => ({ ...o, [key]: e.target.checked }))}
                  style={{ width: 'auto', accentColor: 'var(--apple-blue)' }}
                />
                {lbl}
              </label>
            ))}
          </div>

          {/* Use button */}
          <button type="button" onClick={useGenerated} style={{
            background: 'var(--apple-blue)', color: '#fff',
            border: 'none', borderRadius: 'var(--r-sm)',
            padding: '8px 14px', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', width: '100%',
          }}>
            Bu Şifreyi Kullan
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Type picker tab bar ────────────────────────────────── */

function TypePicker({ value, onChange }: { value: ItemType; onChange: (t: ItemType) => void }) {
  return (
    <div style={{
      display: 'flex', gap: '4px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--r-md)',
      padding: '4px',
    }}>
      {ITEM_TYPES.map(({ id, label, icon: Icon, color }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 4px',
            borderRadius: 'var(--r-sm)',
            border: 'none',
            background: value === id ? 'rgba(255,255,255,0.09)' : 'transparent',
            color: value === id ? color : 'var(--text-tertiary)',
            cursor: 'pointer',
            transition: 'all 120ms',
            fontSize: '10px',
            fontWeight: value === id ? 600 : 400,
          }}
        >
          <Icon size={16} strokeWidth={2} />
          {label}
        </button>
      ))}
    </div>
  );
}

/* ─── Form sections by type ──────────────────────────────── */

function LoginFields({ data, setData }: { data: Partial<VaultItem>; setData: (d: Partial<VaultItem>) => void }) {
  return (
    <>
      <FormField label="Kullanıcı Adı / E-posta">
        <input type="text" placeholder="ornek@email.com" value={data.username ?? ''} onChange={e => setData({ ...data, username: e.target.value })} autoComplete="off" />
      </FormField>
      <FormField label="Şifre">
        <PasswordInput value={data.password ?? ''} onChange={v => setData({ ...data, password: v })} />
      </FormField>
      <FormField label="Web Sitesi (isteğe bağlı)">
        <input type="url" placeholder="https://example.com" value={data.url ?? ''} onChange={e => setData({ ...data, url: e.target.value })} />
      </FormField>
    </>
  );
}

function CardFields({ data, setData }: { data: Partial<VaultItem>; setData: (d: Partial<VaultItem>) => void }) {
  const fmtNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  return (
    <>
      <FormField label="Kart Sahibi">
        <input type="text" placeholder="AD SOYAD" value={data.cardHolder ?? ''} onChange={e => setData({ ...data, cardHolder: e.target.value.toUpperCase() })} />
      </FormField>
      <FormField label="Kart Numarası">
        <input
          type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
          value={data.cardNumber ?? ''}
          onChange={e => setData({ ...data, cardNumber: fmtNumber(e.target.value) })}
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
        />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <FormField label="Son Kullanma (AA/YY)">
          <input
            type="text" inputMode="numeric" placeholder="MM/YY" maxLength={5}
            value={data.cardExpiry ?? ''}
            onChange={e => {
              let v = e.target.value.replace(/\D/g, '').slice(0, 4);
              if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
              setData({ ...data, cardExpiry: v });
            }}
          />
        </FormField>
        <FormField label="CVV">
          <input type="text" inputMode="numeric" placeholder="•••" maxLength={4} value={data.cardCvv ?? ''} onChange={e => setData({ ...data, cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
        </FormField>
      </div>
    </>
  );
}

function NoteFields({ data, setData }: { data: Partial<VaultItem>; setData: (d: Partial<VaultItem>) => void }) {
  return (
    <FormField label="Not İçeriği">
      <textarea
        placeholder="Güvenli notunuzu buraya yazın…"
        value={data.noteContent ?? ''}
        onChange={e => setData({ ...data, noteContent: e.target.value })}
        rows={6}
        style={{ resize: 'vertical', lineHeight: 1.6 }}
      />
    </FormField>
  );
}

function TotpFields({ data, setData }: { data: Partial<VaultItem>; setData: (d: Partial<VaultItem>) => void }) {
  return (
    <>
      <FormField label="Hizmet Adı (İssuer)">
        <input type="text" placeholder="Google, GitHub, vb." value={data.issuer ?? ''} onChange={e => setData({ ...data, issuer: e.target.value })} />
      </FormField>
      <FormField label="Gizli Anahtar (Base32)">
        <input
          type="text" placeholder="JBSWY3DPEHPK3PXP"
          value={data.totpSecret ?? ''}
          onChange={e => setData({ ...data, totpSecret: e.target.value.toUpperCase().replace(/\s/g, '') })}
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
        />
      </FormField>
    </>
  );
}

function PasskeyFields({ data, setData }: { data: Partial<VaultItem>; setData: (d: Partial<VaultItem>) => void }) {
  return (
    <>
      <FormField label="Alan Adı (RP Domain)">
        <input type="text" placeholder="example.com" value={data.rpDomain ?? ''} onChange={e => setData({ ...data, rpDomain: e.target.value })} />
      </FormField>
      <FormField label="Kullanıcı Adı / ID">
        <input type="text" placeholder="user@example.com" value={data.usernameId ?? ''} onChange={e => setData({ ...data, usernameId: e.target.value })} />
      </FormField>
    </>
  );
}

/* ─── Main Modal ─────────────────────────────────────────── */

export function AddItemModal({ open, editItem, defaultType = 'login', onClose, onSave }: Props) {
  const [type, setType] = useState<ItemType>(defaultType);
  const [title, setTitle] = useState('');
  const [data, setData] = useState<Partial<VaultItem>>({});
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Reset / populate when opened */
  useEffect(() => {
    if (open) {
      if (editItem) {
        setType(editItem.type);
        setTitle(editItem.title);
        setData({ ...editItem });
      } else {
        setType(defaultType);
        setTitle('');
        setData({});
      }
    }
  }, [open, editItem, defaultType]);

  /* Backdrop click to close */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  /* Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const item: VaultItem = {
      id: editItem?.id ?? crypto.randomUUID(),
      type,
      title: title.trim(),
      ...data,
    };
    await onSave(item);
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  const typeInfo = ITEM_TYPES.find(t => t.id === type)!;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.50)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 150ms ease both',
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>

      <div style={{
        width: '100%', maxWidth: '500px',
        maxHeight: '90vh', overflowY: 'auto',
        background: 'rgba(30, 30, 32, 0.96)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 'var(--r-xl)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'slideUp 250ms cubic-bezier(0.34,1.56,0.64,1) both',
        margin: '0 16px',
      }}>
        <style>{`@keyframes slideUp { from { opacity:0; transform:scale(0.94) translateY(12px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: `${typeInfo.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: typeInfo.color,
            }}>
              <typeInfo.icon size={16} strokeWidth={2} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em' }}>
              {editItem ? 'Öğeyi Düzenle' : 'Yeni Öğe Ekle'}
            </span>
          </div>
          <button className="btn-icon" onClick={onClose} title="Kapat">
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Type picker — only for new items */}
            {!editItem && (
              <FormField label="Tür">
                <TypePicker value={type} onChange={setType} />
              </FormField>
            )}

            {/* Title */}
            <FormField label="İsim">
              <input
                type="text"
                placeholder={
                  type === 'login'   ? 'örn. GitHub' :
                  type === 'card'    ? 'örn. İş Kartım' :
                  type === 'note'    ? 'örn. WiFi Şifreleri' :
                  type === 'totp'    ? 'örn. Google 2FA' :
                  'örn. Apple ID Passkey'
                }
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                autoFocus
              />
            </FormField>

            {/* Dynamic type-specific fields */}
            {type === 'login'   && <LoginFields   data={data} setData={setData} />}
            {type === 'card'    && <CardFields    data={data} setData={setData} />}
            {type === 'note'    && <NoteFields    data={data} setData={setData} />}
            {type === 'totp'    && <TotpFields    data={data} setData={setData} />}
            {type === 'passkey' && <PasskeyFields data={data} setData={setData} />}
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', gap: '8px', justifyContent: 'flex-end',
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary button button-secondary"
              style={{ width: 'auto', padding: '9px 18px', fontSize: '13px' }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              style={{
                background: 'var(--apple-blue)', color: '#fff',
                border: 'none', borderRadius: 'var(--r-sm)',
                padding: '9px 22px', fontSize: '13px', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving || !title.trim() ? 0.5 : 1,
                display: 'flex', alignItems: 'center', gap: '7px',
                transition: 'all 120ms',
              }}
            >
              {saving && <span className="loading-indicator" style={{ width: '12px', height: '12px' }} />}
              {saving ? 'Kaydediliyor…' : (editItem ? 'Değişiklikleri Kaydet' : 'Kasaya Ekle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
