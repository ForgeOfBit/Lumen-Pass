/**
 * CreditCardWidget — Premium Glassmorphic Card Design for LumenPass.
 * Design language: Apple Card / minimal dark glass.
 * No neon, no colored glows — just depth, clarity, and restraint.
 */

import type { VaultItem } from '../hooks/useVault';
import { detectCardBrand, BRAND_META, maskCardNumber } from '../utils/cardBrands';

/* ─── Chip SVG ─────────────────────────────────────────────── */
const ChipSVG = () => (
  <svg width="38" height="28" viewBox="0 0 38 28" fill="none">
    <rect width="38" height="28" rx="5" fill="url(#cg)" />
    {/* Contact pads */}
    <line x1="12" y1="0" x2="12" y2="28" stroke="rgba(0,0,0,0.10)" strokeWidth="0.8" />
    <line x1="26" y1="0" x2="26" y2="28" stroke="rgba(0,0,0,0.10)" strokeWidth="0.8" />
    <line x1="0" y1="9"  x2="38" y2="9"  stroke="rgba(0,0,0,0.10)" strokeWidth="0.8" />
    <line x1="0" y1="19" x2="38" y2="19" stroke="rgba(0,0,0,0.10)" strokeWidth="0.8" />
    <rect x="13" y="10" width="12" height="8" rx="1.5" fill="rgba(0,0,0,0.08)" />
    <defs>
      <linearGradient id="cg" x1="0" y1="0" x2="38" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   stopColor="#e2cfa0" />
        <stop offset="35%"  stopColor="#c9a952" />
        <stop offset="65%"  stopColor="#e8d88a" />
        <stop offset="100%" stopColor="#b8942e" />
      </linearGradient>
    </defs>
  </svg>
);

/* ─── Amex Platinum (brushed metal) ───────────────────────── */
function AmexPlatinumCard({ item }: { item: VaultItem }) {
  const raw    = (item.cardNumber ?? '').replace(/\s/g, '');
  const masked = raw ? maskCardNumber(raw, 'amex') : '•••• •••••• •••••';

  return (
    <div style={{
      width: '100%', maxWidth: '360px', aspectRatio: '1.586',
      borderRadius: '18px', position: 'relative', overflow: 'hidden',
      margin: '0 auto 20px',
      boxShadow: '0 1px 1px rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.5), 0 16px 40px rgba(0,0,0,0.4)',
    }}>
      {/* Brushed platinum base */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          repeating-linear-gradient(
            89deg,
            transparent 0px, rgba(255,255,255,0.014) 1px,
            transparent 2px, transparent 5px
          ),
          linear-gradient(165deg,
            #b0b0b0 0%, #d8d8d8 12%, #a8a8a8 24%,
            #e0e0e0 36%, #b8b8b8 48%, #d4d4d4 58%,
            #a0a0a0 68%, #cccccc 78%, #d8d8d8 88%, #bebebe 100%
          )
        `,
      }} />
      {/* Specular shine */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(118deg, transparent 38%, rgba(255,255,255,0.16) 48%, rgba(255,255,255,0.06) 53%, transparent 66%)',
        pointerEvents: 'none',
      }} />
      {/* Engraved inner border */}
      <div style={{ position: 'absolute', inset: '10px', border: '0.75px solid rgba(0,0,0,0.12)', borderRadius: '11px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: '12px', border: '0.5px solid rgba(255,255,255,0.35)', borderRadius: '9px', pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{ position: 'absolute', inset: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Top */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <ChipSVG />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', color: '#1c1c1c' }}>
              AMERICAN EXPRESS
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '8.5px', fontWeight: 400, letterSpacing: '0.32em', color: '#444', marginTop: '2px' }}>
              PLATINUM
            </div>
          </div>
        </div>

        {/* Centurion watermark */}
        <div style={{ position: 'absolute', right: '18%', top: '50%', transform: 'translateY(-52%)', width: '72px', height: '72px', opacity: 0.14 }}>
          <img src="/brands/amex-centurion.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'grayscale(1) contrast(1.5)' }} />
        </div>

        {/* Card number */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '15px', letterSpacing: '0.12em', color: '#1a1a1a',
          textShadow: '0 1px 0 rgba(255,255,255,0.55)',
        }}>{masked}</div>

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '7px', letterSpacing: '0.12em', color: '#666', textTransform: 'uppercase', marginBottom: '3px' }}>Kart Sahibi</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', color: '#1a1a1a' }}>
              {item.cardHolder || 'LUMEN USER'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '7px', letterSpacing: '0.12em', color: '#666', textTransform: 'uppercase', marginBottom: '3px' }}>Son Kullanma</div>
            <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{item.cardExpiry || '00/00'}</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '7px', right: '14px', fontSize: '7px', color: 'rgba(0,0,0,0.22)', letterSpacing: '0.06em' }}>© AMEX</div>
    </div>
  );
}

/* ─── Standard Glass Card ──────────────────────────────────── */
function GlassCard({ item }: { item: VaultItem }) {
  const raw    = (item.cardNumber ?? '').replace(/\s/g, '');
  const brand  = detectCardBrand(raw);
  const meta   = BRAND_META[brand];
  const masked = raw ? maskCardNumber(raw, brand) : '•••• •••• •••• ••••';

  /* Very subtle tint per brand — no neon, just a hint */
  const tint: Record<string, string> = {
    visa:       'rgba(10, 18, 80, 0.55)',
    mastercard: 'rgba(20, 10, 8, 0.55)',
    discover:   'rgba(18, 12, 4, 0.55)',
    troy:       'rgba(8, 18, 22, 0.55)',
    unionpay:   'rgba(12, 10, 20, 0.55)',
    jcb:        'rgba(4, 14, 30, 0.55)',
    mir:        'rgba(4, 20, 12, 0.55)',
    maestro:    'rgba(8, 8, 20, 0.55)',
    unknown:    'rgba(12, 12, 14, 0.55)',
  };

  const base = tint[brand] ?? tint.unknown;

  return (
    <div style={{
      width: '100%', maxWidth: '360px', aspectRatio: '1.586',
      borderRadius: '18px', position: 'relative', overflow: 'hidden',
      margin: '0 auto 20px',
      /* Pure dark glass — no colored glow */
      background: `linear-gradient(145deg, rgba(38,38,42,0.95) 0%, rgba(22,22,26,0.98) 100%)`,
      boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset, 0 4px 16px rgba(0,0,0,0.55), 0 20px 50px rgba(0,0,0,0.45)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>

      {/* Very faint brand tint */}
      <div style={{ position: 'absolute', inset: 0, background: base, pointerEvents: 'none' }} />

      {/* Top-left light reflection */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 55% 45% at 18% 18%, rgba(255,255,255,0.055) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Subtle diagonal sheen */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(128deg, transparent 40%, rgba(255,255,255,0.028) 55%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'absolute', inset: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <ChipSVG />
          {meta.logo ? (
            <img
              src={meta.logo}
              alt={meta.label}
              style={{ height: '26px', objectFit: 'contain', opacity: 0.9, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}
            />
          ) : (
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em' }}>
              {meta.label}
            </span>
          )}
        </div>

        {/* Contactless icon — small, refined */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px' }}>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none" opacity={0.35}>
            {[10, 7, 4].map((r, i) => (
              <path
                key={i}
                d={`M ${9 - r * 0.66} ${11 + r * 0.66} A ${r} ${r} 0 0 1 ${9 - r * 0.66} ${11 - r * 0.66}`}
                stroke="white"
                strokeWidth={i === 2 ? 2 : 1.5}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-40 9 11)"
              />
            ))}
          </svg>
        </div>

        {/* Card number */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '15.5px', letterSpacing: '0.13em',
          color: 'rgba(255,255,255,0.88)',
        }}>{masked}</div>

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '7px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', marginBottom: '3px' }}>
              Kart Sahibi
            </div>
            <div style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.82)' }}>
              {item.cardHolder || 'LUMEN USER'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '7px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', marginBottom: '3px' }}>
              Son Kullanma
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.82)' }}>
              {item.cardExpiry || '00/00'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Export ────────────────────────────────────────────────── */
export function CreditCardWidget({ item }: { item: VaultItem }) {
  const raw   = (item.cardNumber ?? '').replace(/\s/g, '');
  const brand = detectCardBrand(raw);
  return brand === 'amex'
    ? <AmexPlatinumCard item={item} />
    : <GlassCard item={item} />;
}
