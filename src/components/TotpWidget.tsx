import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { generateTOTP } from '../utils/totp';

export function TotpWidget({ secret }: { secret: string }) {
  const [current, setCurrent] = useState<{ code: string; progress: number; remaining: number }>({ code: '------', progress: 0, remaining: 0 });
  const [next, setNext] = useState<string>('------');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (current.code === '------' || current.code === 'HATA') return;
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!secret) return;
    let mounted = true;
    
    const tick = async () => {
      const c = await generateTOTP(secret);
      const n = await generateTOTP(secret, 1);
      if (mounted) {
        setCurrent({ code: c.code, progress: c.progress, remaining: c.remainingSeconds });
        setNext(n.code);
      }
    };
    
    tick();
    const iv = setInterval(tick, 1000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [secret]);

  if (!secret) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
      {/* Current Code */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Geçerli Kod</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--c-totp)', letterSpacing: '0.15em' }}>
              {current.code.slice(0,3)} {current.code.slice(3)}
            </div>
            <button
              onClick={handleCopy}
              title="Kodu Kopyala"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px',
                background: copied ? 'rgba(50,215,75,0.15)' : 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: '8px',
                color: copied ? 'var(--apple-green)' : 'var(--text-tertiary)',
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        <div style={{ position: 'relative', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle cx="22" cy="22" r="20" fill="none" stroke="var(--c-totp)" strokeWidth="3" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * current.progress) / 100} style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <span style={{ position: 'absolute', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{current.remaining}s</span>
        </div>
      </div>

      {/* Next Code */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Sonraki Kod</span>
        <span style={{ fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)', opacity: 0.6, letterSpacing: '0.1em' }}>
          {next.slice(0,3)} {next.slice(3)}
        </span>
      </div>
    </div>
  );
}
