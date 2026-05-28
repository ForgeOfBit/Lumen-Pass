import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface Props {
  value: string | undefined;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = 'Seçiniz' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const selectedOpt = options.find(o => o.value === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', fontSize: '13px' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: isOpen ? '1px solid var(--apple-blue)' : '1px solid var(--border-default)',
          borderRadius: 'var(--r-sm)',
          color: selectedOpt ? 'var(--text-primary)' : 'var(--text-tertiary)',
          cursor: 'pointer',
          transition: 'all 150ms',
          textAlign: 'left',
          boxShadow: isOpen ? '0 0 0 3px rgba(10, 132, 255, 0.15)' : 'none',
        }}
      >
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOpt ? (
            <>
              <span>{selectedOpt.label}</span>
              {selectedOpt.subLabel && <span style={{ color: 'var(--text-tertiary)', marginLeft: '6px' }}>{selectedOpt.subLabel}</span>}
            </>
          ) : (
            placeholder
          )}
        </div>
        <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', transition: 'transform 200ms', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'rgba(30, 30, 32, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
          maxHeight: '220px',
          overflowY: 'auto',
          padding: '4px',
          animation: 'dropdownFade 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <style>{`
            @keyframes dropdownFade {
              from { opacity: 0; transform: translateY(-4px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .c-select-opt {
              display: flex;
              align-items: center;
              justifyContent: space-between;
              padding: 8px 10px;
              border-radius: 5px;
              cursor: pointer;
              transition: background 100ms;
              color: var(--text-secondary);
            }
            .c-select-opt:hover {
              background: rgba(255, 255, 255, 0.08);
              color: var(--text-primary);
            }
            .c-select-opt.selected {
              background: rgba(10, 132, 255, 0.15);
              color: var(--apple-blue);
            }
          `}</style>
          
          <div
            className={`c-select-opt ${!value ? 'selected' : ''}`}
            onClick={() => { onChange(''); setIsOpen(false); }}
          >
            <span style={{ fontStyle: 'italic', opacity: 0.7 }}>— Seçimi Temizle —</span>
            {!value && <Check size={14} />}
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 6px' }} />

          {options.length === 0 ? (
            <div style={{ padding: '8px 10px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              Seçenek bulunamadı
            </div>
          ) : (
            options.map(opt => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  className={`c-select-opt ${isSelected ? 'selected' : ''}`}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <span style={{ fontWeight: isSelected ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {opt.label}
                    </span>
                    {opt.subLabel && (
                      <span style={{ color: isSelected ? 'rgba(10,132,255,0.7)' : 'var(--text-tertiary)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {opt.subLabel}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={14} style={{ flexShrink: 0, marginLeft: '8px' }} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
