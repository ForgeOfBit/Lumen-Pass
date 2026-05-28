import { useState, useEffect, useRef } from 'react';
import {
  X, KeySquare, CreditCard, FileText, ShieldCheck, Fingerprint,
  Eye, EyeOff, RefreshCw, Sparkles, Scan, CheckCircle2, AlertCircle
} from 'lucide-react';
import type { VaultItem, ItemType } from '../hooks/useVault';
import { generateSecurePassword, checkPasswordStrength, DEFAULT_GEN_OPTIONS } from '../utils/generator';
import { detectCardBrand, BRAND_META, formatCardNumber } from '../utils/cardBrands';
import { registerPasskey, algName, transportLabel } from '../utils/webauthn';
import { CustomSelect } from './CustomSelect';

/* ─── Item type config ───────────────────────────────────── */
const ITEM_TYPES: { id: ItemType; label: string; icon: typeof KeySquare; color: string }[] = [
  { id: 'login',   label: 'Şifre',          icon: KeySquare,   color: 'var(--c-login)'   },
  { id: 'card',    label: 'Kart',           icon: CreditCard,  color: 'var(--c-card)'    },
  { id: 'note',    label: 'Not',            icon: FileText,    color: 'var(--c-note)'    },
  { id: 'totp',    label: 'TOTP',           icon: ShieldCheck, color: 'var(--c-totp)'    },
  { id: 'passkey', label: 'Passkey',        icon: Fingerprint, color: 'var(--c-passkey)' },
];

const STRENGTH_LABELS = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];
const STRENGTH_COLORS = ['', 'var(--apple-red)', 'var(--apple-orange)', 'var(--apple-yellow)', 'var(--apple-green)'];

/* ─── Props ──────────────────────────────────────────────── */
interface Props {
  open: boolean;
  editItem?: VaultItem | null;
  defaultType?: ItemType;
  loginItems: VaultItem[];   // for TOTP account linking
  onClose: () => void;
  onSave: (item: VaultItem) => Promise<void>;
}

/* ─── Helpers ────────────────────────────────────────────── */
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

/* ─── Password input with generator ─────────────────────── */
function PasswordInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow]       = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [genOpts, setGenOpts] = useState(DEFAULT_GEN_OPTIONS);
  const [generated, setGen]   = useState('');
  const strength = checkPasswordStrength(value);

  const regen = () => setGen(generateSecurePassword(genOpts));
  useEffect(() => { if (genOpen) regen(); }, [genOpen, genOpts]);

  return (
    <div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Şifre girin veya oluşturun"
          style={{ paddingRight: '76px' }}
        />
        <div style={{ position: 'absolute', right: '4px', display: 'flex', gap: '2px' }}>
          <button type="button" className="btn-icon" onClick={() => setShow(v => !v)} style={{ width: '28px', height: '28px' }}>
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button type="button" className="btn-icon" onClick={() => setGenOpen(v => !v)} style={{ width: '28px', height: '28px', color: genOpen ? 'var(--apple-blue)' : undefined }}>
            <Sparkles size={13} />
          </button>
        </div>
      </div>
      {value && (
        <div style={{ marginTop: '6px' }}>
          <div className={`strength-meter strength-score-${strength}`}>
            {[1,2,3,4].map(i => <div key={i} className={`strength-bar bar-${i}`} />)}
          </div>
          <span style={{ fontSize: '10px', color: STRENGTH_COLORS[strength], fontWeight: 600, marginTop: '3px', display: 'block' }}>
            {STRENGTH_LABELS[strength]}
          </span>
        </div>
      )}
      {genOpen && (
        <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <code style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--apple-cyan)', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 'var(--r-sm)', wordBreak: 'break-all', lineHeight: 1.4 }}>
              {generated}
            </code>
            <button type="button" className="btn-icon" onClick={regen}><RefreshCw size={14} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>Uzunluk</span>
            <input type="range" min={8} max={512} value={genOpts.length}
              onChange={e => setGenOpts(o => ({ ...o, length: +e.target.value }))}
              style={{ flex: 1, accentColor: 'var(--apple-blue)', height: '3px' }} />
            <input type="number" min={8} max={512} value={genOpts.length} 
              onChange={e => setGenOpts(o => ({ ...o, length: +e.target.value }))}
              style={{ width: '48px', padding: '4px', fontSize: '12px', fontWeight: 600, color: 'white', textAlign: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', outline: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={genOpts.upper} onChange={e => setGenOpts(o => ({ ...o, upper: e.target.checked }))} style={{ width: 'auto', accentColor: 'var(--apple-blue)' }} />
              A–Z
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={genOpts.lower} onChange={e => setGenOpts(o => ({ ...o, lower: e.target.checked }))} style={{ width: 'auto', accentColor: 'var(--apple-blue)' }} />
              a–z
            </label>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={genOpts.nums} onChange={e => setGenOpts(o => ({ ...o, nums: e.target.checked }))} style={{ width: 'auto', accentColor: 'var(--apple-blue)' }} />
                0–9
              </label>
              {genOpts.nums && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>En az:</span>
                  <input type="number" min={1} max={512} value={genOpts.minNums || 1} onChange={e => setGenOpts(o => ({ ...o, minNums: +e.target.value }))} style={{ width: '42px', padding: '3px 4px', fontSize: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white', textAlign: 'center', outline: 'none' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={genOpts.syms} onChange={e => setGenOpts(o => ({ ...o, syms: e.target.checked }))} style={{ width: 'auto', accentColor: 'var(--apple-blue)' }} />
                !@#
              </label>
              {genOpts.syms && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>En az:</span>
                  <input type="number" min={1} max={512} value={genOpts.minSyms || 1} onChange={e => setGenOpts(o => ({ ...o, minSyms: +e.target.value }))} style={{ width: '42px', padding: '3px 4px', fontSize: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white', textAlign: 'center', outline: 'none' }} />
                </div>
              )}
            </div>
          </div>
          <button type="button" onClick={() => { onChange(generated); setGenOpen(false); }}
            style={{ background: 'var(--apple-blue)', color: '#fff', border: 'none', borderRadius: 'var(--r-sm)', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            Bu Şifreyi Kullan
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Type picker ────────────────────────────────────────── */
function TypePicker({ value, onChange }: { value: ItemType; onChange: (t: ItemType) => void }) {
  return (
    <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '4px' }}>
      {ITEM_TYPES.map(({ id, label, icon: Icon, color }) => (
        <button key={id} type="button" onClick={() => onChange(id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          padding: '8px 4px', borderRadius: 'var(--r-sm)', border: 'none',
          background: value === id ? 'rgba(255,255,255,0.09)' : 'transparent',
          color: value === id ? color : 'var(--text-tertiary)',
          cursor: 'pointer', transition: 'all 120ms',
          fontSize: '10px', fontWeight: value === id ? 600 : 400,
        }}>
          <Icon size={16} strokeWidth={2} />
          {label}
        </button>
      ))}
    </div>
  );
}

/* ─── Login fields ───────────────────────────────────────── */
function LoginFields({ data, setData }: { data: Partial<VaultItem>; setData: (d: Partial<VaultItem>) => void }) {
  const urls = data.urls || (data.url ? [data.url] : ['']);

  const updateUrl = (index: number, val: string) => {
    const newUrls = [...urls];
    newUrls[index] = val;
    setData({ ...data, urls: newUrls, url: newUrls[0] || undefined });
  };

  const addUrl = () => {
    setData({ ...data, urls: [...urls, ''] });
  };

  const removeUrl = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    if (newUrls.length === 0) newUrls.push('');
    setData({ ...data, urls: newUrls, url: newUrls[0] || undefined });
  };

  return (
    <>
      <FormField label="Kullanıcı Adı / E-posta">
        <input type="text" placeholder="ornek@email.com" value={data.username ?? ''} onChange={e => setData({ ...data, username: e.target.value })} autoComplete="off" />
      </FormField>
      <FormField label="Şifre">
        <PasswordInput value={data.password ?? ''} onChange={v => setData({ ...data, password: v })} />
      </FormField>
      <FormField label="Web Siteleri (isteğe bağlı)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {urls.map((u, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px' }}>
              <input type="text" placeholder="example.com" value={u} onChange={e => updateUrl(i, e.target.value)} style={{ flex: 1 }} />
              {urls.length > 1 && (
                <button type="button" onClick={() => removeUrl(i)} className="btn-icon" style={{ flexShrink: 0, color: 'var(--apple-red)' }}>
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addUrl} style={{ background: 'transparent', border: '1px dashed var(--border-default)', color: 'var(--text-secondary)', padding: '8px', borderRadius: 'var(--r-sm)', fontSize: '12px', cursor: 'pointer', transition: 'all 150ms' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}>
            + Yeni Site Ekle
          </button>
        </div>
      </FormField>
    </>
  );
}

/* ─── Card fields with brand detection ──────────────────── */
function CardFields({ data, setData }: { data: Partial<VaultItem>; setData: (d: Partial<VaultItem>) => void }) {
  const raw   = (data.cardNumber ?? '').replace(/\s/g, '');
  const brand = detectCardBrand(raw);
  const meta  = BRAND_META[brand];

  const handleNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, meta.numberLength);
    setData({ ...data, cardNumber: formatCardNumber(digits, brand) });
  };

  return (
    <>
      {/* Brand indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)' }}>
        {meta.logo
          ? <img src={meta.logo} alt={meta.label} style={{ height: '22px', objectFit: 'contain' }} />
          : <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{meta.label}</span>}
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {brand === 'unknown' ? 'Kart numarası girildiğinde marka otomatik tespit edilir' : meta.label}
        </span>
      </div>

      <FormField label="Kart Sahibi">
        <input type="text" placeholder="AD SOYAD" value={data.cardHolder ?? ''} onChange={e => setData({ ...data, cardHolder: e.target.value.toUpperCase() })} />
      </FormField>
      <FormField label="Kart Numarası">
        <input
          type="text" inputMode="numeric"
          placeholder={brand === 'amex' ? '0000 000000 00000' : '0000 0000 0000 0000'}
          value={data.cardNumber ?? ''}
          onChange={e => handleNumber(e.target.value)}
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
        />
      </FormField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <FormField label="Son Kullanma (AA/YY)">
          <input type="text" inputMode="numeric" placeholder="MM/YY" maxLength={5}
            value={data.cardExpiry ?? ''}
            onChange={e => {
              let v = e.target.value.replace(/\D/g, '').slice(0, 4);
              if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
              setData({ ...data, cardExpiry: v });
            }} />
        </FormField>
        <FormField label={`CVV${meta.cvvLength === 4 ? ' (4 hane)' : ''}`}>
          <input type="text" inputMode="numeric" placeholder={'•'.repeat(meta.cvvLength)} maxLength={meta.cvvLength}
            value={data.cardCvv ?? ''} onChange={e => setData({ ...data, cardCvv: e.target.value.replace(/\D/g, '').slice(0, meta.cvvLength) })} />
        </FormField>
      </div>
    </>
  );
}

/* ─── Note fields ────────────────────────────────────────── */
function NoteFields({ data, setData }: { data: Partial<VaultItem>; setData: (d: Partial<VaultItem>) => void }) {
  return (
    <FormField label="Not İçeriği">
      <textarea placeholder="Güvenli notunuzu buraya yazın…" value={data.noteContent ?? ''} onChange={e => setData({ ...data, noteContent: e.target.value })} rows={6} style={{ resize: 'vertical', lineHeight: 1.6 }} />
    </FormField>
  );
}

/* ─── TOTP fields with account linking ──────────────────── */
function TotpFields({ data, setData, loginItems }: { data: Partial<VaultItem>; setData: (d: Partial<VaultItem>) => void; loginItems: VaultItem[] }) {
  return (
    <>
      <FormField label="Hizmet Adı (Issuer)">
        <input type="text" placeholder="Google, GitHub, Discord…" value={data.issuer ?? ''} onChange={e => setData({ ...data, issuer: e.target.value })} />
      </FormField>
      <FormField label="Gizli Anahtar (Base32)">
        <input
          type="text" placeholder="JBSWY3DPEHPK3PXP"
          value={data.totpSecret ?? ''}
          onChange={e => setData({ ...data, totpSecret: e.target.value.toUpperCase().replace(/\s/g, '') })}
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
        />
      </FormField>
      {/* Account linking */}
      <FormField label="Bağlı Hesap (isteğe bağlı)">
        <CustomSelect
          value={data.linkedAccountId ?? ''}
          onChange={val => setData({ ...data, linkedAccountId: val || undefined })}
          options={loginItems.map(item => ({
            value: item.id,
            label: item.title,
            subLabel: item.username ? `(${item.username})` : undefined
          }))}
          placeholder="— Hesaba bağlama —"
        />
      </FormField>
    </>
  );
}

/* ─── Passkey fields (real WebAuthn) ────────────────────── */
function PasskeyFields({ data, setData }: { data: Partial<VaultItem>; setData: (d: Partial<VaultItem>) => void }) {
  const [status, setStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [rpIdInput, setRpId]     = useState(data.rpId ?? '');
  const [usernameInput, setUname] = useState(data.passkeyUsername ?? '');

  // If already registered (edit mode), show info
  if (data.credentialId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(50,215,75,0.08)', border: '1px solid rgba(50,215,75,0.2)', borderRadius: 'var(--r-md)' }}>
          <CheckCircle2 size={18} color="var(--apple-green)" />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--apple-green)' }}>Passkey Kayıtlı</div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {algName(data.publicKeyAlgorithm ?? -7)} · {data.transports?.map(transportLabel).join(', ')}
            </div>
          </div>
        </div>
        {data.rpId && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Alan adı: <strong style={{ color: 'var(--text-secondary)' }}>{data.rpId}</strong></div>}
        {data.passkeyUsername && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Kullanıcı: <strong style={{ color: 'var(--text-secondary)' }}>{data.passkeyUsername}</strong></div>}
        {data.createdAt && <div style={{ fontSize: '11px', color: 'var(--text-quaternary)' }}>Oluşturuldu: {new Date(data.createdAt).toLocaleString('tr-TR')}</div>}
      </div>
    );
  }

  const handleRegister = async () => {
    if (!usernameInput.trim()) { setErrMsg('Kullanıcı adı gerekli.'); return; }
    setStatus('registering');
    setErrMsg('');
    try {
      const result = await registerPasskey(usernameInput, usernameInput);
      setData({
        ...data,
        rpId:               rpIdInput || result.rpId,
        rpName:             result.rpName,
        passkeyUsername:    result.passkeyUsername,
        credentialId:       result.credentialId,
        userHandle:         result.userHandle,
        publicKeyAlgorithm: result.publicKeyAlgorithm,
        transports:         result.transports,
        createdAt:          result.createdAt,
      });
      setStatus('success');
    } catch (err: any) {
      setErrMsg(err.message ?? 'Passkey kaydı başarısız.');
      setStatus('error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Explanation */}
      <div style={{ padding: '12px', background: 'rgba(10,132,255,0.07)', border: '1px solid rgba(10,132,255,0.15)', borderRadius: 'var(--r-md)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--apple-blue)' }}>Gerçek WebAuthn Passkey</strong> — Cihazınızın biyometrik doğrulayıcısı (Face ID, Touch ID, Windows Hello) kullanılarak platforma özgü bir kriptografik anahtar çifti oluşturulacak. Özel anahtar asla cihazınızdan çıkmaz.
      </div>

      <FormField label="Alan Adı (isteğe bağlı)">
        <input type="text" placeholder={window.location.hostname} value={rpIdInput} onChange={e => setRpId(e.target.value)} />
      </FormField>

      <FormField label="Kullanıcı Adı / E-posta">
        <input type="text" placeholder="user@example.com" value={usernameInput} onChange={e => setUname(e.target.value)} />
      </FormField>

      {errMsg && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 'var(--r-sm)', fontSize: '12px', color: '#ff6961' }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          {errMsg}
        </div>
      )}

      {status === 'success' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(50,215,75,0.08)', border: '1px solid rgba(50,215,75,0.2)', borderRadius: 'var(--r-sm)', fontSize: '12px', color: 'var(--apple-green)' }}>
          <CheckCircle2 size={14} />
          Passkey başarıyla kaydedildi!
        </div>
      ) : (
        <button type="button" onClick={handleRegister} disabled={status === 'registering'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: status === 'registering' ? 'rgba(255,255,255,0.06)' : 'rgba(255,214,10,0.12)',
            border: '1px solid rgba(255,214,10,0.25)',
            color: 'var(--c-passkey)',
            borderRadius: 'var(--r-sm)', padding: '11px 18px',
            fontSize: '13px', fontWeight: 600, cursor: status === 'registering' ? 'not-allowed' : 'pointer',
            transition: 'all 120ms',
          }}>
          {status === 'registering'
            ? <><span className="loading-indicator" style={{ width: '12px', height: '12px', borderTopColor: 'var(--c-passkey)' }} />Biyometrik doğrulama bekleniyor…</>
            : <><Scan size={15} />Passkey Kaydet (Biyometrik)</>}
        </button>
      )}
    </div>
  );
}

/* ─── Main modal ─────────────────────────────────────────── */
export function AddItemModal({ open, editItem, defaultType = 'login', loginItems, onClose, onSave }: Props) {
  const [type, setType]     = useState<ItemType>(defaultType);
  const [title, setTitle]   = useState('');
  const [data, setData]     = useState<Partial<VaultItem>>({});
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (editItem) {
        setType(editItem.type); setTitle(editItem.title); setData({ ...editItem });
      } else {
        setType(defaultType); setTitle(''); setData({});
      }
    }
  }, [open, editItem, defaultType]);

  const handleOverlayClick = (e: React.MouseEvent) => { if (e.target === overlayRef.current) onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    // Passkey requires credentialId to be set
    if (type === 'passkey' && !data.credentialId) return;
    setSaving(true);
    await onSave({ id: editItem?.id ?? crypto.randomUUID(), type, title: title.trim(), ...data });
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  const typeInfo = ITEM_TYPES.find(t => t.id === type)!;
  const isPasskeyWithoutCred = type === 'passkey' && !data.credentialId;

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
        background: 'rgba(30,30,32,0.97)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 'var(--r-xl)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'slideUp 260ms cubic-bezier(0.34,1.56,0.64,1) both',
        margin: '0 16px',
      }}>
        <style>{`@keyframes slideUp { from { opacity:0; transform:scale(0.94) translateY(14px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${typeInfo.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeInfo.color }}>
              <typeInfo.icon size={16} strokeWidth={2} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em' }}>
              {editItem ? 'Öğeyi Düzenle' : 'Yeni Öğe Ekle'}
            </span>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} strokeWidth={2.5} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!editItem && <FormField label="Tür"><TypePicker value={type} onChange={setType} /></FormField>}

            <FormField label="İsim">
              <input
                type="text"
                placeholder={type === 'login' ? 'örn. GitHub' : type === 'card' ? 'örn. Ziraat Kartım' : type === 'note' ? 'örn. WiFi Şifreleri' : type === 'totp' ? 'örn. Google TOTP' : 'örn. Apple Passkey'}
                value={title}
                onChange={e => setTitle(e.target.value)}
                required autoFocus
              />
            </FormField>

            {type === 'login'   && <LoginFields data={data} setData={setData} />}
            {type === 'card'    && <CardFields  data={data} setData={setData} />}
            {type === 'note'    && <NoteFields  data={data} setData={setData} />}
            {type === 'totp'    && <TotpFields  data={data} setData={setData} loginItems={loginItems} />}
            {type === 'passkey' && <PasskeyFields data={data} setData={setData} />}
          </div>

          {/* Footer */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="button button-secondary" style={{ width: 'auto', padding: '9px 18px', fontSize: '13px' }}>
              İptal
            </button>
            <button type="submit" disabled={saving || !title.trim() || isPasskeyWithoutCred} style={{
              background: 'var(--apple-blue)', color: '#fff', border: 'none',
              borderRadius: 'var(--r-sm)', padding: '9px 22px',
              fontSize: '13px', fontWeight: 600,
              cursor: (saving || !title.trim() || isPasskeyWithoutCred) ? 'not-allowed' : 'pointer',
              opacity: (saving || !title.trim() || isPasskeyWithoutCred) ? 0.45 : 1,
              display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 120ms',
            }}>
              {saving && <span className="loading-indicator" style={{ width: '12px', height: '12px' }} />}
              {saving ? 'Kaydediliyor…' : isPasskeyWithoutCred ? 'Önce Passkey Kaydet' : editItem ? 'Değişiklikleri Kaydet' : 'Kasaya Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
