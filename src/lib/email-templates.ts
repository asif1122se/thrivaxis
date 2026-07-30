import type { ContactPayload } from '@/lib/contact-schema';

const COLORS = {
  bg: '#0a0a0a',
  surface: '#111111',
  border: '#262626',
  ink: '#fafafa',
  muted: '#999999',
  accent: '#57ccff',
};

const TIER_LABELS: Record<ContactPayload['tier'], string> = {
  prototype: 'Prototype Swarm (30 Days)',
  production: 'Production Core (1–3 Months)',
  enterprise: 'Enterprise Nexus (3–6 Months)',
};

const COMPLIANCE_LABELS: Record<string, string> = {
  hipaa: 'HIPAA',
  soc2: 'SOC-2',
  gdpr: 'GDPR / CCPA',
  none: 'Standard security',
};

function complianceLabel(compliance: ContactPayload['compliance']): string {
  if (compliance.includes('none')) return 'Standard security';
  return compliance.map((c) => COMPLIANCE_LABELS[c] ?? c.toUpperCase()).join(', ');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shell(footerNote: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:${COLORS.bg};font-family:ui-monospace,Menlo,'Courier New',monospace;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;">
            <!-- Header -->
            <tr>
              <td style="padding:20px 28px;border-bottom:1px solid ${COLORS.border};">
                <span style="color:${COLORS.accent};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">Thrivaxis</span>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:28px;color:${COLORS.ink};font-size:14px;line-height:1.65;">
                ${body}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:16px 28px;border-top:1px solid ${COLORS.border};color:${COLORS.muted};font-size:11px;">
                ${footerNote}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ─── Lead notification (sent to company inbox) ────────────────────────────────

export function buildLeadNotificationEmail(data: ContactPayload): string {
  const messageContent = data.message || data.bottleneck || '';

  // Use proper HTML entities for angle brackets — raw < > get stripped by email clients
  const rows: Array<[string, string]> = [
    ['Name', escapeHtml(data.name)],
    [
      'Email',
      // Clickable mailto link so you can reply in one click
      `<a href="mailto:${escapeHtml(data.email)}" style="color:${COLORS.accent};text-decoration:none;">${escapeHtml(data.email)}</a>`,
    ],
    ['Compliance', escapeHtml(complianceLabel(data.compliance))],
    ['Tier', escapeHtml(TIER_LABELS[data.tier])],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 12px 8px 0;color:${COLORS.muted};width:100px;vertical-align:top;white-space:nowrap;">${label}</td>
          <td style="padding:8px 0;color:${COLORS.ink};">${value}</td>
        </tr>`,
    )
    .join('');

  return shell(
    `Submitted via thrivaxis.com/contact &nbsp;·&nbsp; ${new Date().toUTCString()}`,
    `
    <h1 style="margin:0 0 20px;font-size:19px;font-weight:700;color:${COLORS.ink};letter-spacing:-0.01em;">
      New project inquiry
    </h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="margin-bottom:24px;border:1px solid ${COLORS.border};border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:14px 16px;background:${COLORS.bg};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>

    <div style="color:${COLORS.muted};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">
      Message / Project details
    </div>
    <div style="white-space:pre-wrap;background:${COLORS.bg};border:1px solid ${COLORS.border};border-radius:8px;padding:16px;color:${COLORS.ink};font-size:13px;line-height:1.7;">
      ${escapeHtml(messageContent)}
    </div>

    <div style="margin-top:24px;">
      <a href="mailto:${escapeHtml(data.email)}?subject=Re: Your Thrivaxis inquiry"
        style="display:inline-block;background:${COLORS.accent};color:#0a0a0a;font-size:13px;font-weight:700;padding:10px 20px;border-radius:999px;text-decoration:none;letter-spacing:0.02em;">
        Reply to ${escapeHtml(data.name)} →
      </a>
    </div>
    `,
  );
}

// ─── Auto-reply (sent to the person who submitted) ────────────────────────────

export function buildAutoReplyEmail(data: ContactPayload): string {
  const firstName = data.name.split(' ')[0] ?? data.name;
  const tierLabel = TIER_LABELS[data.tier];

  return shell(
    'Sent automatically by Thrivaxis &nbsp;·&nbsp; Do not reply to this address.',
    `
    <h1 style="margin:0 0 16px;font-size:19px;font-weight:700;color:${COLORS.ink};">
      Message received, ${escapeHtml(firstName)}.
    </h1>

    <p style="color:${COLORS.ink};margin:0 0 12px;">
      Thanks for reaching out to <strong>Thrivaxis</strong>. We've received your inquiry
      and a member of our engineering team will follow up within <strong>one business day</strong>.
    </p>

    <p style="color:${COLORS.muted};margin:0 0 24px;font-size:13px;">
      Your selected scope: <strong style="color:${COLORS.ink};">${escapeHtml(tierLabel)}</strong>
    </p>

    <div style="background:${COLORS.bg};border:1px solid ${COLORS.border};border-radius:8px;padding:16px;margin-bottom:24px;">
      <div style="color:${COLORS.muted};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">
        What we received
      </div>
      <div style="white-space:pre-wrap;color:${COLORS.ink};font-size:13px;line-height:1.7;">
        ${escapeHtml(data.message || data.bottleneck || '')}
      </div>
    </div>

    <p style="color:${COLORS.muted};margin:0;font-size:13px;">
      If you have additional details, reply directly to
      <a href="mailto:company@thrivaxis.com" style="color:${COLORS.accent};text-decoration:none;">company@thrivaxis.com</a>.
    </p>
    `,
  );
}
