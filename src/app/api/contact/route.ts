import dns from 'node:dns';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactSchema } from '@/lib/contact-schema';
import { buildAutoReplyEmail, buildLeadNotificationEmail } from '@/lib/email-templates';
import { isRateLimited } from '@/lib/rate-limit';
import { site } from '@/lib/site';

// Force Node.js to resolve IPv4 addresses first to avoid macOS/undici IPv6 DNS lookup hangs
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore if unsupported in runtime
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Thrivaxis <onboarding@resend.dev>';
const TO_EMAIL =
  process.env.RESEND_TO_EMAIL || process.env.CONTACT_NOTIFICATION_EMAIL || site.contact.email;

/** Direct REST API fallback in case SDK fetch wrapper encounters network resolution issues */
async function sendResendDirect(
  apiKey: string,
  payload: {
    from: string;
    to: string;
    replyTo?: string;
    subject: string;
    html: string;
  },
) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: payload.from,
        to: payload.to,
        reply_to: payload.replyTo,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        data: null,
        error: {
          message:
            body?.message ||
            body?.error?.message ||
            `Resend API error (${response.status}): ${response.statusText}`,
          name: body?.name || 'resend_api_error',
        },
      } as unknown as Awaited<ReturnType<Resend['emails']['send']>>;
    }

    return { data: body, error: null } as unknown as Awaited<ReturnType<Resend['emails']['send']>>;
  } catch (err) {
    return {
      data: null,
      error: {
        message:
          err instanceof Error
            ? `Network error reaching Resend API: ${err.message}`
            : 'Network connection failed reaching Resend API.',
        name: 'network_error',
      },
    } as unknown as Awaited<ReturnType<Resend['emails']['send']>>;
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid submission parameters.', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { company_website: honeypot, ...data } = parsed.data;
  if (honeypot) {
    // Bot filled the hidden field — pretend success, send nothing.
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      // biome-ignore lint/suspicious/noConsole: Dev mock intake logger
      console.log('[DEV MOCK INTAKE] Contact submission received locally:', data);
      return NextResponse.json({
        ok: true,
        devMode: true,
        message: 'Dev mode: Submission logged to server terminal.',
      });
    }
    console.error('RESEND_API_KEY is missing from environment variables.');
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not set in environment variables.' },
      { status: 503 },
    );
  }

  try {
    const resend = new Resend(apiKey);

    // Primary delivery attempt via SDK
    let lead = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: data.email,
      subject: `New project intake — ${data.name}`,
      html: buildLeadNotificationEmail(data),
    });

    // If SDK encounters a network error ('fetch failed' or 'Unable to fetch data'), retry with direct REST fetch
    if (
      lead.error &&
      (lead.error.message?.includes('Unable to fetch data') ||
        lead.error.message?.includes('fetch failed') ||
        !lead.data)
    ) {
      lead = await sendResendDirect(apiKey, {
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: data.email,
        subject: `New project intake — ${data.name}`,
        html: buildLeadNotificationEmail(data),
      });
    }

    if (lead.error) {
      console.error('Resend lead email delivery failed:', lead.error);
      return NextResponse.json(
        {
          error:
            lead.error.message ||
            'Failed to send email via Resend. Please check your API key and verified domain settings.',
        },
        { status: 502 },
      );
    }

    // Courtesy auto-reply send
    let autoReply = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'We received your message',
      html: buildAutoReplyEmail(data),
    });

    if (
      autoReply.error &&
      (autoReply.error.message?.includes('Unable to fetch data') ||
        autoReply.error.message?.includes('fetch failed'))
    ) {
      autoReply = await sendResendDirect(apiKey, {
        from: FROM_EMAIL,
        to: data.email,
        subject: 'We received your message',
        html: buildAutoReplyEmail(data),
      });
    }

    if (autoReply.error) {
      console.warn('Resend auto-reply notice:', autoReply.error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Unhandled error sending contact email:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong sending your message. Please try again.',
      },
      { status: 502 },
    );
  }
}
