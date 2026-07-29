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
  production: 'Production Core (1-3 Months)',
  enterprise: 'Enterprise Nexus (3-6 Months)',
};

function complianceLabel(compliance: ContactPayload['compliance']): string {
  if (compliance.includes('none')) return 'Standard security';
  return compliance.map((c) => c.toUpperCase()).join(', ');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shell(title: string, body: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${COLORS.bg};font-family:ui-monospace,Menlo,monospace;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid ${COLORS.border};">
                <span style="color:${COLORS.accent};font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Thrivaxis</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:${COLORS.ink};font-size:14px;line-height:1.6;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;border-top:1px solid ${COLORS.border};color:${COLORS.muted};font-size:11px;">
                ${title}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildLeadNotificationEmail(data: ContactPayload): string {
  const messageContent = data.message || data.bottleneck || '';
  const rows: Array<[string, string]> = [
    ['From', `${escapeHtml(data.name)} <${escapeHtml(data.email)}>`],
    ['Compliance', escapeHtml(complianceLabel(data.compliance))],
    ['Tier', escapeHtml(TIER_LABELS[data.tier])],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 0;color:${COLORS.muted};width:120px;vertical-align:top;">${label}</td><td style="padding:6px 0;">${value}</td></tr>`,
    )
    .join('');

  return shell(
    'New contact submission from thrivaxis.com/contact',
    `
    <h1 style="margin:0 0 16px;font-size:18px;color:${COLORS.ink};">New project inquiry</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">${rowsHtml}</table>
    <div style="color:${COLORS.muted};margin-bottom:6px;">Message</div>
    <div style="white-space:pre-wrap;background:${COLORS.bg};border:1px solid ${COLORS.border};border-radius:8px;padding:14px;">${escapeHtml(messageContent)}</div>
    `,
  );
}

export function buildAutoReplyEmail(data: ContactPayload): string {
  return shell(
    'Sent automatically by thrivaxis.com',
    `
    <h1 style="margin:0 0 16px;font-size:18px;color:${COLORS.ink};">We received your message, ${escapeHtml(data.name.split(' ')[0] ?? data.name)}.</h1>
    <p style="color:${COLORS.ink};margin:0 0 16px;">
      Thanks for reaching out to Thrivaxis. A member of our team will review your message and reply within one business day.
    </p>
    <p style="color:${COLORS.muted};margin:0;">In the meantime, reply to this email directly if you have additional details to share.</p>
    `,
  );
}
