import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const htmlPath = resolve(process.cwd(), 'index.html');
const html = await readFile(htmlPath, 'utf8');

const checks = [];

function check(id, description, pass, severity, evidence) {
  checks.push({ id, description, pass: Boolean(pass), severity, evidence });
}

const has = (pattern) => pattern.test(html);

check(
  'exit-dialog-semantics',
  'Exit-intent surface is identified as an accessible modal dialog.',
  has(/id=["']exitModal["'][^>]*role=["']dialog["'][^>]*aria-modal=["']true["']/i),
  'critical',
  'Expected #exitModal with role="dialog" and aria-modal="true".',
);

check(
  'exit-dialog-close-control',
  'Exit-intent dialog exposes a named close control.',
  has(/id=["']exitModalClose["'][^>]*aria-label=["'][^"']*close/i),
  'critical',
  'Expected a close button with an accessible name.',
);

check(
  'exit-dialog-escape',
  'Escape closes the exit-intent dialog.',
  has(/keydown[\s\S]{0,500}(Escape|Esc)/i),
  'critical',
  'Expected a keydown listener that handles Escape.',
);

check(
  'exit-dialog-focus',
  'Opening and closing the dialog manages focus explicitly.',
  has(/\.focus\s*\(/) && has(/exitModal/i),
  'critical',
  'Expected focus entry and focus restoration associated with the modal.',
);

check(
  'exit-dialog-once',
  'Exit intent is bounded to one presentation per session or explicit consent state.',
  has(/sessionStorage|localStorage|exit(?:Intent)?Shown|hasShownExit/i),
  'warning',
  'Expected a session-scoped presentation guard.',
);

check(
  'newsletter-email',
  'Newsletter/whitepaper form requests an email using a required email input.',
  has(/<input[^>]*type=["']email["'][^>]*required/i),
  'critical',
  'Expected type="email" and required.',
);

check(
  'newsletter-consent',
  'The form communicates consent or links to a privacy notice.',
  has(/consent|privacy|data use|unsubscribe/i),
  'critical',
  'Expected a privacy/consent disclosure near the form.',
);

check(
  'newsletter-result-state',
  'Submission exposes success and failure states rather than only suppressing navigation.',
  has(/aria-live|role=["']status["']|submission.*(?:success|error)|catch\s*\(/i),
  'critical',
  'Expected visible status handling for success and failure.',
);

check(
  'audio-user-initiated',
  'Audio is initialized or resumed only from a user gesture.',
  has(/audioToggle[\s\S]{0,1200}(click|pointerup)[\s\S]{0,1200}(AudioContext|resume\s*\()/i),
  'critical',
  'Expected AudioContext creation/resume inside an audio-toggle interaction.',
);

check(
  'audio-default-off',
  'Ambient audio defaults to off or muted.',
  has(/(?:audioEnabled|soundEnabled|isPlaying|isMuted)\s*=\s*(?:false|true)/i) || has(/audio-toggle[^>]*muted/i),
  'warning',
  'Expected an explicit default-off state.',
);

check(
  'haptic-capability',
  'Haptic feedback is capability checked and optional.',
  has(/['"]vibrate['"]\s+in\s+navigator|typeof\s+navigator\.vibrate|navigator\.vibrate\s*&&/i),
  'critical',
  'Expected a capability guard before vibration.',
);

check(
  'reduced-motion-css',
  'A reduced-motion CSS fallback exists.',
  has(/@media\s*\(prefers-reduced-motion\s*:\s*reduce\)/i),
  'critical',
  'Expected prefers-reduced-motion: reduce.',
);

check(
  'reduced-motion-runtime',
  'JavaScript animation loops consult reduced-motion preference.',
  has(/matchMedia\s*\([^)]*prefers-reduced-motion/i),
  'warning',
  'Expected runtime animation and particle systems to avoid starting under reduced motion.',
);

check(
  'scroll-progress-aria',
  'Scroll progress updates aria-valuenow as well as visual width.',
  has(/scrollProgress[\s\S]{0,1200}aria-valuenow/i),
  'critical',
  'Expected the progressbar accessible value to update.',
);

check(
  'analytics-placeholder-disabled',
  'Analytics remains disabled until a real consent and data-minimization decision exists.',
  !has(/gtag\s*\(\s*['"]config['"]\s*,\s*['"]G-[A-Z0-9]+/i),
  'critical',
  'A real GA measurement ID must not be active in this evidence-only stage.',
);

check(
  'aggregate-rating-evidence',
  'Structured rating claims are not published without a documented evidence source.',
  !has(/"aggregateRating"/i),
  'critical',
  'The current static schema.org aggregate rating requires substantiation or removal.',
);

const summary = {
  generatedAt: new Date().toISOString(),
  source: 'index.html',
  sourcePolicy: 'static evidence audit; no product files modified',
  totals: {
    checks: checks.length,
    passed: checks.filter((item) => item.pass).length,
    failed: checks.filter((item) => !item.pass).length,
    criticalFailures: checks.filter((item) => !item.pass && item.severity === 'critical').length,
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
  const marker = item.pass ? 'PASS' : 'FAIL';
  console.log(`${marker} [${item.severity}] ${item.id}: ${item.description}`);
}

console.log(JSON.stringify(summary.totals));

if (summary.totals.criticalFailures > 0) {
  process.exitCode = 1;
}
