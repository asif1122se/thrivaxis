import https from 'node:https';
import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/contact-schema';
import { buildAutoReplyEmail, buildLeadNotificationEmail } from '@/lib/email-templates';
import { isRateLimited } from '@/lib/rate-limit';
import { site } from '@/lib/site';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmailPayload {
  from: string;
  to: string | string[];
  reply_to?: string;
  subject: string;
  html: string;
}

interface ResendResponse {
  id?: string;
  message?: string;
  name?: string;
  statusCode?: number;
}

// ─── Core: native https POST to Resend REST API ───────────────────────────────
// Uses Node's built-in https module, bypassing undici/fetch entirely.
// This is more reliable than fetch() in environments where the IPv6 DNS
// resolution hangs (macOS + VPN, some serverless cold-start configurations).

function resendPost(apiKey: string, payload: EmailPayload): Promise<ResendResponse> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk: Buffer) => {
          raw += chunk.toString();
        });
        res.on('end', () => {
          try {
            const json: ResendResponse = JSON.parse(raw);
            resolve(json);
          } catch {
            resolve({ message: `Non-JSON response (${res.statusCode}): ${raw.slice(0, 200)}` });
          }
        });
      },
    );

    req.setTimeout(12_000, () => {
      req.destroy(new Error('Resend API request timed out after 12 s.'));
    });

    req.on('error', (err: Error) => reject(err));
    req.write(body);
    req.end();
  });
}

// ─── Helper: normalise the from string (strip stray outer quotes) ─────────────

function sanitiseFrom(raw: string): string {
  return raw.trim().replace(/^"(.*)"$/, '$1').trim();
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  // Parse body
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Validate
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid submission parameters.', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Environment
  const apiKey = process.env.RESEND_API_KEY?.trim();


  const fromEmail = sanitiseFrom(
    process.env.RESEND_FROM_EMAIL ?? `Thrivaxis <${site.contact.email}>`,
  );
  const toEmail =
    process.env.RESEND_TO_EMAIL?.trim() ||
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim() ||
    site.contact.email;

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      // biome-ignore lint/suspicious/noConsole: dev mock
      console.log('[DEV MOCK] Submission received (no RESEND_API_KEY):', data);
      return NextResponse.json({
        ok: true,
        devMode: true,
        message: 'Dev mode: RESEND_API_KEY not set. Submission logged to server terminal.',
      });
    }
    console.error('[Contact API] RESEND_API_KEY missing from environment.');
    return NextResponse.json(
      { error: 'Email service is not configured. Please contact us directly.' },
      { status: 503 },
    );
  }

  // biome-ignore lint/suspicious/noConsole: diagnostic
  console.log(`[Contact API] Dispatching → from: "${fromEmail}" | to: "${toEmail}"`);

  // ── 1. Lead notification ──────────────────────────────────────────────────
  const tierLabel =
    data.tier === 'prototype'
      ? 'Prototype'
      : data.tier === 'enterprise'
        ? 'Enterprise'
        : 'Production';

  let leadResult: ResendResponse;
  try {
    leadResult = await resendPost(apiKey, {
      from: fromEmail,
      to: toEmail,
      reply_to: data.email,
      subject: `[Thrivaxis Lead] ${data.name} <${data.email}> — ${tierLabel} tier`,
      html: buildLeadNotificationEmail(data),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Contact API] Lead email network error:', msg);
    return NextResponse.json(
      { error: `Network error reaching email service: ${msg}` },
      { status: 502 },
    );
  }

  // Resend returns { id } on success and { name, message } on error.
  if (!leadResult.id) {
    const errMsg = leadResult.message ?? 'Resend rejected the lead email.';
    console.error('[Contact API] Lead email rejected by Resend:', leadResult);
    return NextResponse.json({ error: errMsg }, { status: 502 });
  }

  // biome-ignore lint/suspicious/noConsole: diagnostic
  console.log(`[Contact API] Lead email sent — ID: ${leadResult.id}`);

  // ── 2. Auto-reply to the sender ────────────────────────────────────────────
  const firstName = data.name.split(' ')[0] ?? data.name;
  try {
    const replyResult = await resendPost(apiKey, {
      from: fromEmail,
      to: data.email,
      subject: `${firstName}, we received your Thrivaxis inquiry`,
      html: buildAutoReplyEmail(data),
    });

    if (!replyResult.id) {
      console.warn('[Contact API] Auto-reply rejected by Resend:', replyResult);
    } else {
      // biome-ignore lint/suspicious/noConsole: diagnostic
      console.log(`[Contact API] Auto-reply sent — ID: ${replyResult.id}`);
    }
  } catch (err) {
    // Non-fatal — lead notification already succeeded
    console.warn('[Contact API] Auto-reply network error (non-fatal):', err);
  }

  return NextResponse.json({ ok: true });
}
