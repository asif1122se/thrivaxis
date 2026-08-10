'use client';

import { ArrowUpRight, Check, RefreshDouble } from 'iconoir-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { site } from '@/lib/site';

type TierType = 'prototype' | 'production' | 'enterprise';

export function AgenticTriage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [tier, setTier] = useState<TierType>('production');

  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setTier('production');
    setSubmitState('idle');
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setSubmitError('Please fill out all required fields.');
      return;
    }

    setSubmitState('sending');
    setSubmitError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          tier,
          compliance: ['none'],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || 'Something went wrong. Please try again or email us directly.',
        );
      }

      setSubmitState('sent');
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="relative w-full max-w-3xl rounded-3xl border border-border bg-surface-2/40 p-4 sm:p-6 md:p-10 shadow-glow backdrop-blur-md">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-border border-b pb-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose/60" />
          <span className="h-2 w-2 rounded-full bg-warm/60" />
          <span className="h-2 w-2 rounded-full bg-accent/60" />
        </div>
        <span className="truncate font-mono text-[10px] sm:text-label text-muted uppercase tracking-wider sm:tracking-widest">
          THRIVAXIS — DIRECT_INTAKE
        </span>
        <div className="h-2 w-2" />
      </div>

      <AnimatePresence mode="wait">
        {submitState === 'sent' ? (
          <motion.div
            key="success-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6 py-4"
          >
            <div className="flex items-center gap-3 text-accent">
              <div className="flex size-10 items-center justify-center rounded-full border border-accent/30 bg-accent/10 shrink-0">
                <Check className="size-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display text-h3 sm:text-h2 text-ink tracking-tight">
                  Message Transmitted.
                </h3>
                <span className="font-mono text-accent text-caption uppercase tracking-wider">
                  Status 200 — Dispatch Confirmed
                </span>
              </div>
            </div>

            <p className="text-body-sm sm:text-body text-muted leading-relaxed">
              Thank you, <span className="font-medium text-ink">{name}</span>. We've received your
              message and sent a confirmation email to{' '}
              <span className="font-medium text-ink">{email}</span>. A member of the Thrivaxis
              engineering team will respond within one business day.
            </p>

            <div className="flex flex-col justify-between gap-4 border-border/50 border-t pt-6 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-border bg-surface px-5 py-3 font-mono text-caption text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <RefreshDouble className="size-4" />
                SEND ANOTHER MESSAGE
              </button>
              <a
                href={`mailto:${site.contact.email}`}
                className="text-center sm:text-right font-mono text-caption text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                Direct email: {site.contact.email}
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 sm:gap-6"
          >
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="font-display text-h2 sm:text-h1 text-ink tracking-tight">
                Get in touch with our team.
              </h3>
              <p className="text-body-sm sm:text-body text-muted leading-relaxed">
                Submit your inquiry directly below. No extra steps or interactive prompts required.
              </p>
            </div>

            {/* Name & Email inputs */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-name"
                  className="font-mono text-caption text-muted uppercase tracking-wider"
                >
                  Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  autoComplete="name"
                  className="w-full rounded-xl border border-border bg-bg p-3.5 sm:p-4 font-mono text-base sm:text-body-sm text-ink outline-none transition-all focus:border-accent/40 focus:ring-1 focus:ring-accent/40"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-email"
                  className="font-mono text-caption text-muted uppercase tracking-wider"
                >
                  Work Email *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-border bg-bg p-3.5 sm:p-4 font-mono text-base sm:text-body-sm text-ink outline-none transition-all focus:border-accent/40 focus:ring-1 focus:ring-accent/40"
                />
              </div>
            </div>

            {/* Message input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="contact-message"
                className="font-mono text-caption text-muted uppercase tracking-wider"
              >
                Message / Project Details *
              </label>
              <textarea
                id="contact-message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your project scope, engineering requirements, or operational challenges..."
                rows={4}
                className="w-full rounded-xl border border-border bg-bg p-3.5 sm:p-4 font-mono text-base sm:text-body-sm text-ink outline-none transition-all focus:border-accent/40 focus:ring-1 focus:ring-accent/40"
              />
            </div>

            {/* Optional Project Scope Tier Selector */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-caption text-muted uppercase tracking-wider">
                Target Timeline (Optional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'prototype', label: 'Prototype (30 Days)' },
                  { id: 'production', label: 'Production (1-3 Mo)' },
                  { id: 'enterprise', label: 'Enterprise (3+ Mo)' },
                ].map((item) => {
                  const active = tier === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTier(item.id as TierType)}
                      className={cn(
                        'rounded-xl border px-3 py-2.5 text-center font-mono text-caption transition-all',
                        active
                          ? 'border-accent/40 bg-accent/10 font-medium text-accent'
                          : 'border-border bg-bg/50 text-muted hover:border-border/80 hover:text-ink',
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error banner */}
            {submitError && (
              <p className="rounded-lg border border-rose/20 bg-rose/10 px-4 py-2 font-mono text-body-sm text-rose">
                {submitError}
              </p>
            )}

            {/* Submit & Fallback links */}
            <div className="flex flex-col gap-4 border-border/50 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={
                  submitState === 'sending' || !name.trim() || !email.trim() || !message.trim()
                }
                className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-accent px-8 py-3.5 font-medium text-bg text-sm shadow-[0_0_40px_-5px_var(--color-accent-glow)] transition-all duration-300 hover:scale-102 hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-50"
              >
                {submitState === 'sending' ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <ArrowUpRight className="size-4" />
                  </>
                )}
              </button>

              <a
                href={`mailto:${site.contact.email}`}
                className="text-center sm:text-right font-mono text-caption text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                or email directly: {site.contact.email}
              </a>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
