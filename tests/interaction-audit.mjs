import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function readOptional(path) {
  try {
    return await readFile(resolve(process.cwd(), path), 'utf8');
  } catch {
    return '';
  }
}

const [html, css, javascript] = await Promise.all([
  readOptional('index.html'),
  readOptional('styles.css'),
  readOptional('app.js'),
]);

if (!html) throw new Error('index.html is required for the interaction audit.');

const activeHtml = html.replace(/<!--[\s\S]*?-->/g, '');
const activeSource = `${activeHtml}\n${css}\n${javascript}`;
const checks = [];

function check(id, description, applicable, passed, severity, evidence) {
  const status = !applicable ? 'not-applicable' : passed ? 'pass' : 'fail';
  checks.push({
    id,
    description,
    applicable: Boolean(applicable),
    pass: status !== 'fail',
    status,
    severity,
    evidence,
  });
}

const has = (pattern) => pattern.test(activeSource);
const htmlHas = (pattern) => pattern.test(activeHtml);
const cssHas = (pattern) => pattern.test(css);
const jsHas = (pattern) => pattern.test(javascript);

const hasExitDialog = htmlHas(/id=["']exitModal["']/i);
const hasNewsletter =
  htmlHas(/<form[^>]*(newsletter|whitepaper)/i) ||
  htmlHas(/class=["'][^"']*(newsletter|whitepaper)/i) ||
  htmlHas(/<input[^>]*type=["']email["']/i);
const hasAudio = htmlHas(/id=["']audioToggle["']/i) || jsHas(/AudioContext/i);
const hasHaptics = jsHas(/navigator\.vibrate|\bvibrate\s*\(/i);
const hasScrollProgress = htmlHas(/id=["']scrollProgress["']/i);
const hasMotionRuntime = jsHas(/requestAnimationFrame|IntersectionObserver|particle/i);

check(
  'exit-dialog-semantics',
  'If exit intent exists, it is identified as an accessible modal dialog.',
  hasExitDialog,
  htmlHas(/id=["']exitModal["'][^>]*role=["']dialog["'][^>]*aria-modal=["']true["']/i),
  'critical',
  'Expected #exitModal with role="dialog" and aria-modal="true" when the feature exists.',
);

check(
  'exit-dialog-close-control',
  'If exit intent exists, it exposes a named close control.',
  hasExitDialog,
  htmlHas(/id=["']exitModalClose["'][^>]*aria-label=["'][^"']*close/i),
  'critical',
  'Expected a close button with an accessible name when the feature exists.',
);

check(
  'exit-dialog-escape',
  'If exit intent exists, Escape closes it.',
  hasExitDialog,
  jsHas(/keydown[\s\S]{0,1000}(Escape|Esc)/i),
  'critical',
  'Expected a keydown listener that handles Escape when the feature exists.',
);

check(
  'exit-dialog-focus',
  'If exit intent exists, opening and closing it manages focus explicitly.',
  hasExitDialog,
  jsHas(/\.focus\s*\(/) && jsHas(/exitModal/i),
  'critical',
  'Expected focus entry and restoration associated with the modal.',
);

check(
  'exit-dialog-once',
  'If exit intent exists, it is bounded to one presentation per session.',
  hasExitDialog,
  has(/sessionStorage|exit(?:Intent)?Shown|hasShownExit/i),
  'warning',
  'Expected a session-scoped guard when the feature exists.',
);

check(
  'newsletter-email',
  'If newsletter or whitepaper capture exists, it uses a required email input.',
  hasNewsletter,
  htmlHas(/<input[^>]*type=["']email["'][^>]*required/i),
  'critical',
  'Expected type="email" and required when the feature exists.',
);

check(
  'newsletter-consent',
  'If email capture exists, it communicates consent or links to a privacy notice.',
  hasNewsletter,
  has(/consent|privacy|data use|unsubscribe/i),
  'critical',
  'Expected privacy and consent disclosure near the form.',
);

check(
  'newsletter-result-state',
  'If email capture exists, submission exposes honest success and failure states.',
  hasNewsletter,
  has(/aria-live|role=["']status["']|submission.*(?:success|error)|catch\s*\(/i),
  'critical',
  'Expected visible status handling for success and failure.',
);

check(
  'audio-user-initiated',
  'If audio exists, its context is initialized or resumed only from a user gesture.',
  hasAudio,
  jsHas(/audioButton\.addEventListener\(["']click["'][\s\S]*?(AudioContext|resume\s*\()/i),
  'critical',
  'Expected AudioContext creation or resume inside the audio-toggle click handler.',
);

check(
  'audio-default-off',
  'If audio exists, it defaults to off.',
  hasAudio,
  htmlHas(/id=["']audioToggle["'][^>]*aria-pressed=["']false["']/i),
  'warning',
  'Expected the audio control to declare aria-pressed="false" initially.',
);

check(
  'haptic-capability',
  'If haptics exist, vibration is capability checked and optional.',
  hasHaptics,
  jsHas(/["']vibrate["']\s+in\s+navigator|typeof\s+navigator\.vibrate|navigator\.vibrate\s*&&/i),
  'critical',
  'Expected a capability guard before vibration.',
);

check(
  'reduced-motion-css',
  'Animated interfaces provide a reduced-motion CSS fallback.',
  hasMotionRuntime,
  cssHas(/@media\s*\(prefers-reduced-motion\s*:\s*reduce\)/i),
  'critical',
  'Expected prefers-reduced-motion: reduce in styles.css.',
);

check(
  'reduced-motion-runtime',
  'JavaScript animation loops consult reduced-motion preference.',
  hasMotionRuntime,
  jsHas(/matchMedia\s*\([^)]*prefers-reduced-motion/i),
  'warning',
  'Expected runtime animation and particle systems to avoid starting under reduced motion.',
);

check(
  'scroll-progress-aria',
  'If scroll progress exists, it updates aria-valuenow as well as visual width.',
  hasScrollProgress,
  htmlHas(/id=["']scrollProgress["'][^>]*role=["']progressbar["']/i) &&
    jsHas(/scrollProgress|const\s+progress/i) &&
    jsHas(/setAttribute\(["']aria-valuenow["']/i),
  'critical',
  'Expected progressbar semantics and a runtime aria-valuenow update.',
);

check(
  'analytics-placeholder-disabled',
  'Analytics remains disabled until a consent and data-minimization decision exists.',
  true,
  !has(/gtag\s*\(\s*["']config["']\s*,\s*["']G-[A-Z0-9]+/i),
  'critical',
  'A real GA measurement ID must not be active in executable source.',
);

check(
  'aggregate-rating-evidence',
  'Structured rating claims are not published without a documented source.',
  true,
  !has(/"aggregateRating"/i),
  'critical',
  'An aggregate rating requires dated, queryable supporting evidence.',
);

const summary = {
  generatedAt: new Date().toISOString(),
  sources: ['index.html', 'styles.css', 'app.js'],
  sourcePolicy: 'feature-aware static evidence audit; absent optional features are not applicable',
  totals: {
    checks: checks.length,
    applicable: checks.filter((item) => item.applicable).length,
    skipped: checks.filter((item) => item.status === 'not-applicable').length,
    passed: checks.filter((item) => item.status === 'pass').length,
    failed: checks.filter((item) => item.status === 'fail').length,
    criticalFailures: checks.filter(
      (item) => item.status === 'fail' && item.severity === 'critical',
    ).length,
  },
  checks,
};

await mkdir(resolve(process.cwd(), 'artifacts'), { recursive: true });
await writeFile(
  resolve(process.cwd(), 'artifacts/interaction-audit.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
  'utf8',
);

for (const item of checks) {
  const marker = item.status === 'pass' ? 'PASS' : item.status === 'fail' ? 'FAIL' : 'SKIP';
  console.log(`${marker} [${item.severity}] ${item.id}: ${item.description}`);
}

console.log(JSON.stringify(summary.totals));

if (summary.totals.criticalFailures > 0) process.exitCode = 1;
