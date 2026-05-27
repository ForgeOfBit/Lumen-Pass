import { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import type { useVault } from '../hooks/useVault';

export function LockScreen({ vault }: { vault: ReturnType<typeof useVault> }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    if (!vault.isInitialized) {
      if (password !== confirmPassword) {
        setLocalError('Şifreler eşleşmiyor.');
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setLocalError('Master şifre en az 8 karakter olmalıdır.');
        setLoading(false);
        return;
      }
      await vault.initializeVault(password);
    } else {
      await vault.unlockVault(password);
    }
    setLoading(false);
  };

  const displayError = localError || vault.error;
  const isInit = !vault.isInitialized;

  return (
    <div id="lock-screen" className="lock-overlay">
      <div className="lock-container">
        {/* Logo icon */}
        <div className="lock-icon-wrapper">
          <Lock size={30} strokeWidth={1.8} />
        </div>

        <h1 id="lock-title">
          {isInit ? 'Kasanı Oluştur' : 'Kasanı Aç'}
        </h1>
        <p id="lock-subtitle">
          {isInit
            ? 'Sıfır bilgi kasanı şifrelemek için bir master şifre belirle.'
            : 'Kasaya erişmek için master şifrenle yerel şifre çözümü yap.'}
        </p>

        {displayError && (
          <div className="error-box">{displayError}</div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', textAlign: 'left' }}>
          {/* Password input */}
          <div style={{ marginBottom: '12px' }}>
            <div className="input-group">
              <KeyRound className="input-icon" size={16} strokeWidth={2} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Master Şifre"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '10px',
                  background: 'none', border: 'none',
                  color: 'var(--text-tertiary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  transition: 'color 120ms'
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm password (init only) */}
          {isInit && (
            <div style={{ marginBottom: '12px' }}>
              <div className="input-group">
                <ShieldCheck className="input-icon" size={16} strokeWidth={2} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Şifreyi Tekrar Gir"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <button
              type="submit"
              className="btn-primary button button-primary"
              disabled={loading}
            >
              {loading && <span className="loading-indicator" />}
              {loading
                ? (isInit ? 'Kasa oluşturuluyor...' : 'Şifre çözülüyor...')
                : (isInit ? 'Sıfır Bilgi Kasası Oluştur' : 'Güvenli Aç')}
            </button>
          </div>
        </form>

        {/* Footer hint */}
        <p style={{
          marginTop: '24px',
          fontSize: '11px',
          color: 'var(--text-quaternary)',
          lineHeight: 1.5,
        }}>
          🔒 Verileriniz yalnızca cihazınızda şifrelenir. Şifreniz sunucularımıza gönderilmez.
        </p>
      </div>
    </div>
  );
}
