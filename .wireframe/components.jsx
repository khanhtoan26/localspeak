// Shared UI atoms for LocalSpeak

const T = {
  bg: '#fafaf7',
  card: '#ffffff',
  ink: '#161513',
  inkSoft: '#5a564f',
  inkMute: '#9b968d',
  line: '#ebe7df',
  beige: '#e8e4dc',
  beigeSoft: '#f1ede4',
  // semantic
  pauseShort: '#c8c2b4',
  pauseLex: '#d97757',     // warm coral
  pauseThink: '#b88a3e',   // amber
  pauseGram: '#7a6cc8',    // muted violet
  good: '#3f6b4f',
  // type
  serif: '"Instrument Serif", "Iowan Old Style", Georgia, serif',
  sans: 'Inter, -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
};
window.T = T;

// ───────── primitives ─────────
function Card({ children, style = {}, onClick, padding = 16 }) {
  return (
    <div onClick={onClick} style={{
      background: T.card, borderRadius: 18, padding,
      border: `1px solid ${T.line}`,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

function Tag({ children, color = T.beige, ink = T.ink, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 999,
      background: color, color: ink,
      fontSize: 11, fontWeight: 500, letterSpacing: 0.1,
      fontFamily: T.sans,
      ...style,
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = 'primary', style = {}, full = true }) {
  const variants = {
    primary: { bg: T.ink, fg: '#fff', border: 'transparent' },
    secondary: { bg: 'transparent', fg: T.ink, border: T.ink },
    ghost: { bg: 'transparent', fg: T.ink, border: 'transparent' },
    beige: { bg: T.beige, fg: T.ink, border: 'transparent' },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} style={{
      width: full ? '100%' : 'auto',
      padding: '14px 18px', borderRadius: 14,
      background: v.bg, color: v.fg,
      border: `1px solid ${v.border}`,
      fontFamily: T.sans, fontSize: 15, fontWeight: 500,
      letterSpacing: -0.1, cursor: 'pointer',
      ...style,
    }}>{children}</button>
  );
}

function SectionLabel({ children, action, onAction }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '0 4px', marginBottom: 10,
    }}>
      <div style={{
        fontFamily: T.sans, fontSize: 11, fontWeight: 600,
        color: T.inkMute, letterSpacing: 1.4, textTransform: 'uppercase',
      }}>{children}</div>
      {action && <div onClick={onAction} style={{
        fontFamily: T.sans, fontSize: 12, color: T.inkSoft, cursor: 'pointer',
      }}>{action}</div>}
    </div>
  );
}

// ───────── Score ring (SVG) ─────────
function ScoreRing({ value, max = 9, size = 88, stroke = 6, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={T.line} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={T.ink} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: T.serif, fontSize: size * 0.36, color: T.ink, lineHeight: 1 }}>
          {value.toFixed(1)}
        </div>
        {label && <div style={{
          fontFamily: T.sans, fontSize: 9, color: T.inkMute,
          letterSpacing: 1, textTransform: 'uppercase', marginTop: 3,
        }}>{label}</div>}
      </div>
    </div>
  );
}

// ───────── Pause legend dot ─────────
function PauseDot({ kind, size = 8 }) {
  const colors = {
    natural: T.pauseShort,
    lexical: T.pauseLex,
    thinking: T.pauseThink,
    grammar: T.pauseGram,
  };
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      borderRadius: '50%', background: colors[kind] || T.inkMute,
    }} />
  );
}

// ───────── Icons (minimal stroke) ─────────
const Icon = {
  mic: (s = 20, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/>
    </svg>
  ),
  back: (s = 20, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  ),
  flame: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none">
      <path d="M12 2c0 4-5 5-5 10a5 5 0 0010 0c0-2-1-3-2-4 0 2-1 3-2 3 0-3 2-5-1-9z"/>
    </svg>
  ),
  chevron: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6"/>
    </svg>
  ),
  pause: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>
    </svg>
  ),
  play: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M7 5l12 7-12 7z"/></svg>
  ),
  stop: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
  ),
  spark: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>
    </svg>
  ),
  clock: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
    </svg>
  ),
};
window.Icon = Icon;
window.Card = Card;
window.Tag = Tag;
window.Btn = Btn;
window.SectionLabel = SectionLabel;
window.ScoreRing = ScoreRing;
window.PauseDot = PauseDot;
