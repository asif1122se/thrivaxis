'use client';

import { ArrowUpRight, Check, Cpu, RefreshDouble } from 'iconoir-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { site } from '@/lib/site';

type ComplianceType = 'hipaa' | 'soc2' | 'gdpr' | 'none';
type TierType = 'prototype' | 'production' | 'enterprise';

export function AgenticTriage() {
  const [step, setStep] = useState<number>(0);

  // Intake State
  const [bottleneck, setBottleneck] = useState('');
  const [compliance, setCompliance] = useState<ComplianceType[]>([]);
  const [tier, setTier] = useState<TierType>('production');

  // Simulated logs state
  const [logLines, setLogLines] = useState<
    { id: string; level: 'info' | 'ok' | 'warn'; message: string }[]
  >([]);

  // Toggle compliance
  const handleToggleCompliance = (type: ComplianceType) => {
    if (type === 'none') {
      setCompliance(['none']);
    } else {
      setCompliance((prev) => {
        const filtered = prev.filter((t) => t !== 'none');
        if (filtered.includes(type)) {
          return filtered.filter((t) => t !== type);
        }
        return [...filtered, type];
      });
    }
  };

  // Run swarm simulation
  useEffect(() => {
    if (step !== 4) return;

    setLogLines([]);
    const logs = [
      {
        delay: 100,
        log: {
          id: '1',
          level: 'info' as const,
          message: 'agent.swarm_boot() ↳ session_initialized=tx_contact_flow',
        },
      },
      {
        delay: 500,
        log: {
          id: '2',
          level: 'info' as const,
          message: `context.ingest() ↳ parsing bottleneck details: "${bottleneck.substring(0, 40)}..."`,
        },
      },
      {
        delay: 1100,
        log: {
          id: '3',
          level: 'ok' as const,
          message: 'context.ingested ↳ 102 tokens mapped to operational constraints',
        },
      },
      {
        delay: 1600,
        log: {
          id: '4',
          level: 'info' as const,
          message: `guards.evaluate() ↳ active policies: ${compliance.length > 0 ? compliance.join(', ').toUpperCase() : 'STANDARD_SECURITY'}`,
        },
      },
      {
        delay: 2100,
        log: {
          id: '5',
          level: 'ok' as const,
          message: 'guards.validated ↳ zero violations identified in routing schema',
        },
      },
      {
        delay: 2600,
        log: {
          id: '6',
          level: 'info' as const,
          message: `engine.reasoning() ↳ evaluating tier architecture: ${tier.toUpperCase()}`,
        },
      },
      {
        delay: 3200,
        log: {
          id: '7',
          level: 'ok' as const,
          message: 'reasoning.complete ↳ mapped 4 optimal agent nodes and vector schema',
        },
      },
      {
        delay: 3700,
        log: {
          id: '8',
          level: 'info' as const,
          message: 'blueprint.compile() ↳ formatting markdown configuration',
        },
      },
      {
        delay: 4200,
        log: {
          id: '9',
          level: 'ok' as const,
          message: 'swarm.finished ↳ handoff complete to client UI',
        },
      },
    ];

    const timers: NodeJS.Timeout[] = [];
    logs.forEach(({ delay, log }) => {
      const timer = setTimeout(() => {
        setLogLines((prev) => [...prev, log]);
      }, delay);
      timers.push(timer);
    });

    const completionTimer = setTimeout(() => {
      setStep(5);
    }, 4800);
    timers.push(completionTimer);

    return () => {
      for (const t of timers) {
        clearTimeout(t);
      }
    };
  }, [step, bottleneck, compliance, tier]);

  // Restart the flow
  const handleRestart = () => {
    setBottleneck('');
    setCompliance([]);
    setTier('production');
    setStep(0);
  };

  // Generate blueprint text for pre-filling email
  const generateBlueprintText = () => {
    return `THRIVAXIS SYSTEM ARCHITECTURE BLUEPRINT
========================================
[System Intake Identification: ${Math.floor(100000 + Math.random() * 900000)}]

Operational Bottleneck:
"${bottleneck}"

Required Policies/Compliance:
${compliance.length > 0 ? compliance.map((c) => `- ${c.toUpperCase()}`).join('\n') : '- STANDARD_SECURITY'}

Target Architecture Scope:
- Tier: ${tier === 'prototype' ? 'PROTOTYPE SWARM (30 Days)' : tier === 'production' ? 'PRODUCTION CORE (1-3 Months)' : 'ENTERPRISE NEXUS (3-6 Months)'}

Suggested Model Layer:
- Primary: Gemini 2.5 Flash
- Secondary: Gemini 2.5 Pro (complex reasoning fallback)
- Architecture: Retrieval-Augmented Generation (RAG) with vector data storage

Suggested Swarm Nodes:
1. Intake Parser Node (Extracts payload structure)
2. Evaluation Validator Node (Enforces compliance constraints)
3. Integration Gateway Node (Performs webhook delivery)

----------------------------------------
Targeting Project Initialization via Thrivaxis.
`;
  };

  const handleEmailBlueprint = () => {
    const subject = encodeURIComponent('Project Blueprint Initialization');
    const body = encodeURIComponent(generateBlueprintText());
    window.location.href = `mailto:${site.contact.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="relative w-full max-w-3xl rounded-3xl border border-border bg-surface-2/40 p-6 shadow-glow backdrop-blur-md md:p-10">
      {/* Terminal Title Header */}
      <div className="mb-6 flex items-center justify-between border-border border-b pb-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose/60" />
          <span className="h-2 w-2 rounded-full bg-warm/60" />
          <span className="h-2 w-2 rounded-full bg-accent/60" />
        </div>
        <span className="font-mono text-label text-muted uppercase tracking-widest">
          {step === 4
            ? 'SYSTEM // REASONING_RUN'
            : `THRIVAXIS // INTAKE_PROTOCOL [STEP 0${step}/05]`}
        </span>
        <div className="h-2 w-2" />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Welcome / Initialize */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            <div className="space-y-3">
              <h3 className="font-display text-h1 text-ink tracking-tight">
                Let's architect your solution.
              </h3>
              <p className="text-body text-muted leading-relaxed">
                Rather than standard forms, our client-side intake protocol helps you structure your
                project scope. Detail your bottleneck, configure compliance rules, and simulate a
                swarm reasoning session to compile a custom technical blueprint.
              </p>
            </div>

            <div className="flex justify-start pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="group inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 font-medium text-bg text-sm transition-all duration-300 hover:scale-105 hover:bg-accent-strong"
              >
                Initialize Intake Protocol
                <ArrowUpRight className="size-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 1: Bottleneck Input */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5"
          >
            <div className="space-y-2">
              <span className="font-mono text-accent text-caption uppercase tracking-wider">
                01. Operational Bottleneck
              </span>
              <h3 className="font-display text-h2 text-ink tracking-tight">
                What process is holding you back?
              </h3>
              <p className="text-body-sm text-muted">
                Describe the repetitive manual task or technical bottleneck in plain English.
              </p>
            </div>

            <div className="relative mt-2">
              <textarea
                value={bottleneck}
                onChange={(e) => setBottleneck(e.target.value)}
                placeholder="e.g. We spend 15 hours a week manually copy-pasting structured data from vendor invoice PDFs into our database..."
                rows={4}
                className="w-full rounded-xl border border-border bg-bg p-4 font-mono text-body-sm text-ink outline-none transition-all focus:border-accent/40 focus:ring-1 focus:ring-accent/40"
              />
            </div>

            <div className="flex items-center justify-between border-border/50 border-t pt-4">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="font-mono text-caption text-muted transition-colors hover:text-ink"
              >
                [00] BACK
              </button>
              <button
                type="button"
                disabled={!bottleneck.trim()}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-medium text-bg text-sm transition-all duration-300 hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
              >
                Next Step
                <ArrowUpRight className="size-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Compliance */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5"
          >
            <div className="space-y-2">
              <span className="font-mono text-accent text-caption uppercase tracking-wider">
                02. Safety Constraints
              </span>
              <h3 className="font-display text-h2 text-ink tracking-tight">
                Do you require specific compliance?
              </h3>
              <p className="text-body-sm text-muted">
                We design systems around rigorous privacy and security guidelines. Select all that
                apply.
              </p>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { id: 'hipaa', title: 'HIPAA compliant', desc: 'Secure medical data handling.' },
                {
                  id: 'soc2',
                  title: 'SOC-2 audit ready',
                  desc: 'Enterprise telemetry & policies.',
                },
                {
                  id: 'gdpr',
                  title: 'GDPR / CCPA privacy',
                  desc: 'Explicit consent & data deletion.',
                },
                {
                  id: 'none',
                  title: 'Standard security',
                  desc: 'General industry best practices.',
                },
              ].map((item) => {
                const active = compliance.includes(item.id as ComplianceType);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleCompliance(item.id as ComplianceType)}
                    className={cn(
                      'flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all hover:bg-surface',
                      active ? 'border-accent/40 bg-accent/5' : 'border-border bg-bg/50',
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium text-body-sm text-ink">{item.title}</span>
                      {active && <Check className="size-4 animate-pulse text-accent" />}
                    </div>
                    <p className="text-caption text-muted">{item.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-border/50 border-t pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-mono text-caption text-muted transition-colors hover:text-ink"
              >
                [01] BACK
              </button>
              <button
                type="button"
                disabled={compliance.length === 0}
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-medium text-bg text-sm transition-all duration-300 hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
              >
                Next Step
                <ArrowUpRight className="size-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Project Tier */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5"
          >
            <div className="space-y-2">
              <span className="font-mono text-accent text-caption uppercase tracking-wider">
                03. Project Scope
              </span>
              <h3 className="font-display text-h2 text-ink tracking-tight">
                Select your engineering tier.
              </h3>
              <p className="text-body-sm text-muted">
                Match the target speed and complexity of the initial deployment.
              </p>
            </div>

            <div className="mt-2 flex flex-col gap-3">
              {[
                {
                  id: 'prototype',
                  title: 'Prototype Swarm',
                  time: '30 Days',
                  desc: 'Rapid proof-of-concept to validate capabilities, run evals, and verify ROI.',
                },
                {
                  id: 'production',
                  title: 'Production Core',
                  time: '1-3 Months',
                  desc: 'Secure, production-grade deployment with full compliance structures and live APIs.',
                },
                {
                  id: 'enterprise',
                  title: 'Enterprise Nexus',
                  time: '3-6 Months',
                  desc: 'Custom multi-agent workflows, bespoke models, full compliance, and dedicated telemetry.',
                },
              ].map((item) => {
                const active = tier === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTier(item.id as TierType)}
                    className={cn(
                      'flex flex-col justify-between gap-4 rounded-2xl border p-5 text-left transition-all hover:bg-surface md:flex-row md:items-center',
                      active ? 'border-accent/40 bg-accent/5' : 'border-border bg-bg/50',
                    )}
                  >
                    <div className="space-y-1 md:max-w-xl">
                      <span className="font-medium text-body-sm text-ink">{item.title}</span>
                      <p className="text-caption text-muted">{item.desc}</p>
                    </div>
                    <span className="self-start rounded border border-accent/25 px-2 py-0.5 font-mono text-accent text-xs uppercase md:self-center">
                      {item.time}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-border/50 border-t pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="font-mono text-caption text-muted transition-colors hover:text-ink"
              >
                [02] BACK
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-bg text-sm shadow-[0_0_40px_-5px_var(--color-accent-glow)] transition-all duration-300 hover:scale-105 hover:bg-accent-strong"
              >
                Trigger Swarm Orchestration
                <ArrowUpRight className="size-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Swarm Running (Simulation) */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            <div className="space-y-2 py-4 text-center">
              <Cpu className="mx-auto size-10 animate-spin text-accent" />
              <h3 className="mt-2 font-display text-h3 text-ink tracking-tight">
                Running Swarm Protocol...
              </h3>
              <p className="text-caption text-muted">
                Synthesizing architecture nodes and pipeline parameters.
              </p>
            </div>

            <div className="flex min-h-[220px] w-full flex-col gap-2 rounded-xl border border-border bg-bg p-5 font-mono text-caption text-muted leading-relaxed">
              {logLines.map((line) => (
                <div key={line.id} className="flex animate-fade-in items-start gap-3">
                  <span
                    className={cn(
                      'w-3 select-none text-center font-bold',
                      line.level === 'ok' ? 'text-accent' : 'text-cool',
                    )}
                  >
                    {line.level === 'ok' ? '✓' : '·'}
                  </span>
                  <span className="whitespace-pre-wrap text-ink/90">{line.message}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 5: Finished Blueprint */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent">
                <Check className="size-5" />
                <span className="font-mono text-caption uppercase tracking-wider">
                  System Blueprint Compiled
                </span>
              </div>
              <h3 className="font-display text-h2 text-ink tracking-tight">
                Your custom AI architecture.
              </h3>
              <p className="text-body-sm text-muted">
                Our reasoning agent parsed your bottlenecks and generated this engineering protocol.
              </p>
            </div>

            {/* Custom Preloaded Layout instead of static Shiki */}
            <div className="scrollbar-thin max-h-[300px] w-full overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-bg p-5 font-mono text-caption text-ink/90 leading-relaxed">
              {generateBlueprintText()}
            </div>

            <div className="flex flex-col gap-4 border-border/50 border-t pt-4 sm:flex-row">
              <button
                type="button"
                onClick={handleEmailBlueprint}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-bg text-sm shadow-[0_0_40px_-5px_var(--color-accent-glow)] transition-all duration-300 hover:scale-102 hover:bg-accent-strong"
              >
                Send Blueprint & Initialize Project
                <ArrowUpRight className="size-4" />
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-3.5 font-mono text-caption text-muted transition-colors hover:text-ink"
              >
                <RefreshDouble className="size-4 animate-spin-slow" />
                RE-RUN PROTOCOL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
