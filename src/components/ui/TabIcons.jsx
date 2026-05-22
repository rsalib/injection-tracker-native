// Material Symbols Rounded tab icons (Tier 2 Step 2.3, v91).
//
// Replaces the prior 6 hand-drawn SVG pairs with Google's variable-axis
// icon font. The font itself is imported in src/index.css; here we render
// `<span class="material-symbols-rounded">` with the icon name as the
// ligature text. `currentColor` is inherited from the Pressable's `color`
// style in App.jsx (M3 primary active / textMuted inactive).
//
// Outline ↔ Filled is driven by the FILL variable axis (0 ↔ 1).
// AnimatedTabIcon.jsx renders both variants and cross-fades opacity —
// keeping the existing two-component API so the consumer (App.jsx tab bar)
// needs zero edits.
//
// Icon-name choices:
//   Dashboard    → "home"          (M3 standard nav-home glyph)
//   LogInjection → "vaccines"      (syringe — matches the prior hand-drawn icon)
//   Medications  → "medication"    (pill bottle — matches prior intent)
//   Calculator   → "calculate"     (calculator with operators)
//   Resources    → "menu_book"     (open book — matches prior bookshelf metaphor)
//   AIAssistant  → "auto_awesome"  (sparkles — AI cue without the banned 🤖)

const BASE_STYLE = {
  fontSize: 24,
  width: 24,
  height: 24,
  lineHeight: '24px',
  textAlign: 'center',
  color: 'currentColor',
};

// Optical-size + weight + grade locked at the M3-recommended defaults for
// 24px. FILL flips per variant; rest stays constant so cross-fade reads as
// a pure weight/shape interpolation between two stable poses.
const VARIATION = (fill) =>
  `'FILL' ${fill}, 'wght' 500, 'GRAD' 0, 'opsz' 24`;

function Symbol({ name, filled }) {
  return (
    <span
      className="material-symbols-rounded"
      style={{ ...BASE_STYLE, fontVariationSettings: VARIATION(filled ? 1 : 0) }}
    >
      {name}
    </span>
  );
}

export function DashboardIcon()        { return <Symbol name="home"         filled={false} />; }
export function DashboardIconFilled()  { return <Symbol name="home"         filled={true}  />; }

export function LogIcon()              { return <Symbol name="vaccines"     filled={false} />; }
export function LogIconFilled()        { return <Symbol name="vaccines"     filled={true}  />; }

export function MedsIcon()             { return <Symbol name="medication"   filled={false} />; }
export function MedsIconFilled()       { return <Symbol name="medication"   filled={true}  />; }

export function CalcIcon()             { return <Symbol name="calculate"    filled={false} />; }
export function CalcIconFilled()       { return <Symbol name="calculate"    filled={true}  />; }

export function ResourcesIcon()        { return <Symbol name="menu_book"    filled={false} />; }
export function ResourcesIconFilled()  { return <Symbol name="menu_book"    filled={true}  />; }

export function AIIcon()               { return <Symbol name="auto_awesome" filled={false} />; }
export function AIIconFilled()         { return <Symbol name="auto_awesome" filled={true}  />; }
