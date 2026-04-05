'use client';

import Link from 'next/link';
import { MotionConfig, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  ArrowRight, Bot, Sparkles, Wrench, ShieldCheck, Zap,
  CheckCircle2, TrendingUp, Clock, AlertTriangle, Sun, Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── Motion stagger ─────────────────────── */
const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.12 } } },
  item: {
    hidden: { opacity: 0, y: 28 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  },
};

/* ── Typing animation ───────────────────── */
const words = ['triages', 'routes', 'resolves'];

function TypingWord() {
  const [index, setIndex]       = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting]  = useState(false);

  useEffect(() => {
    const word = words[index];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1400);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 50);
    } else {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, index]);

  return (
    <span className="text-gradient">
      {displayed}
      <span className="ml-0.5 inline-block w-[3px] animate-pulse bg-primary align-middle opacity-80">|</span>
    </span>
  );
}

/* ── Theme toggle button ────────────────── */
function NavThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;
  const isDark = resolvedTheme === 'dark';
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background/60 text-foreground/70 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

/* ── Stat badge ─────────────────────────── */
function StatBadge({ icon, label, value, delay = 0 }: { icon: ReactNode; label: string; value: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 120 }}
      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-card backdrop-blur-sm"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className="text-sm font-bold">{value}</div>
      </div>
    </motion.div>
  );
}

/* ── Feature card ───────────────────────── */
function FeatureCard({ icon, title, desc, accent }: { icon: ReactNode; title: string; desc: string; accent: string }) {
  return (
    <motion.div
      variants={stagger.item}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-card backdrop-blur-sm hover:shadow-card-lg transition-all"
    >
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ── Triage preview row ─────────────────── */
function PreviewRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={highlight
        ? 'rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary'
        : 'text-xs font-medium'}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Main landing page ──────────────────── */
export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">

        {/* Background blobs — only visible in dark mode */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden dark:block hidden">
          <div className="absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse-slow" />
          <div className="absolute top-1/2 -right-60 h-[600px] w-[600px] rounded-full bg-cyan-500/15 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
          <div className="absolute inset-0 opacity-[0.035]"
            style={{ backgroundImage: 'radial-gradient(circle,#ffffff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        {/* Light mode subtle gradient */}
        <div className="pointer-events-none fixed inset-0 -z-10 dark:hidden"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, hsl(var(--primary)/0.08) 0%, transparent 70%)' }} />

        {/* ── Navbar ── */}
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow-sm">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-lg font-black tracking-tight">
                FixGenie<span className="text-gradient"> AI</span>
              </span>
            </div>

            {/* Nav actions */}
            <div className="flex items-center gap-2">
              <NavThemeToggle />
              <Link href="/login">
                <Button variant="ghost" className="hidden rounded-full sm:flex">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-5 font-semibold shadow-glow hover:scale-105 transition-all">
                  Get started <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* ── Hero ── */}
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-16 pt-12 sm:gap-14 sm:pb-24 sm:pt-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-24">

          {/* Left — copy */}
          <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-8">

            <motion.div
              variants={stagger.item}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              NLP-Powered Maintenance Platform
            </motion.div>

            <motion.h1
              variants={stagger.item}
              className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              AI that{' '}<TypingWord />{' '}maintenance issues.
            </motion.h1>

            <motion.p variants={stagger.item} className="max-w-xl text-lg text-muted-foreground leading-relaxed">
              FixGenie understands requests in plain language — auto-classifies, predicts
              priority, detects duplicates, and routes tickets to the right technician instantly.
            </motion.p>

            <motion.div variants={stagger.item} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="h-12 w-full rounded-full px-8 text-base font-bold shadow-glow hover:-translate-y-0.5 transition-all sm:w-auto">
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/chat" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="h-12 w-full rounded-full px-8 text-base hover:border-primary/40 hover:bg-primary/5 transition-all sm:w-auto">
                  <Bot className="mr-2 h-4 w-4 text-primary" />
                  Talk to FixBot
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={stagger.item} className="grid grid-cols-2 gap-3">
              <StatBadge icon={<TrendingUp className="h-4 w-4" />} label="Avg. resolution time" value="< 4 hours" delay={0.3} />
              <StatBadge icon={<CheckCircle2 className="h-4 w-4" />} label="Accuracy rate" value="98.7%" delay={0.45} />
            </motion.div>
          </motion.div>

          {/* Right — triage preview card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-3xl" />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8, type: 'spring', stiffness: 80 }}
              className="relative w-full max-w-[480px]"
            >
              {/* Main card */}
              <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-7 shadow-card-lg backdrop-blur-2xl">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

                {/* Terminal header */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-3 font-mono text-[11px] text-muted-foreground">fixgenie — triage engine</span>
                  </div>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500 dark:text-emerald-400"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                    LIVE
                  </motion.span>
                </div>

                {/* Input simulation */}
                <div className="mb-5 rounded-xl bg-muted/50 px-4 py-3 font-mono text-sm dark:bg-black/30">
                  <span className="mr-2 text-emerald-500 dark:text-emerald-400">›</span>
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: 'auto' }}
                    transition={{ delay: 0.9, duration: 1.4 }}
                    className="inline-block overflow-hidden whitespace-nowrap"
                  >
                    Water leaking from ceiling near Room 305.
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="ml-0.5 inline-block h-4 w-0.5 align-middle bg-foreground/60"
                  />
                </div>

                {/* Output rows */}
                <div className="space-y-2.5">
                  {[
                    { label: 'Category', value: 'Plumbing', highlight: true },
                    { label: 'Priority', value: 'High — risk of damage', highlight: true },
                    { label: 'Assigned to', value: 'Plumbing Specialist' },
                    { label: 'ETA', value: 'Within 4 hours' },
                  ].map((row, i) => (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + i * 0.14, duration: 0.45 }}
                    >
                      <PreviewRow {...row} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating badge — bottom left (sm+) */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -left-4 hidden sm:flex items-center gap-3 rounded-2xl border border-border/60 bg-card/90 px-4 py-3 shadow-card-lg backdrop-blur-xl"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Duplicate detected</div>
                  <div className="text-sm font-bold">1 ticket merged</div>
                </div>
              </motion.div>

              {/* Floating badge — top right (sm+) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-3 -top-5 hidden sm:flex items-center gap-2 rounded-2xl border border-border/60 bg-card/90 px-3.5 py-2.5 shadow-card-lg backdrop-blur-xl"
              >
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <div className="text-xs font-semibold">
                  High Priority <span className="text-muted-foreground font-normal">auto-flagged</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:pb-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Why FixGenie?
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Everything you need to <span className="text-gradient">fix faster</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
              One AI-native platform covering the full maintenance lifecycle — from report to resolution.
            </p>
          </motion.div>

          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { icon: <Sparkles className="h-5 w-5" />, title: 'NLP-Powered Triage', desc: 'Understands freeform text, classifies issues instantly, and extracts metadata — no forms needed.', accent: 'bg-violet-500/15 text-violet-500 dark:text-violet-400' },
              { icon: <Bot className="h-5 w-5" />,      title: 'AI Troubleshooting', desc: 'FixBot guides users and technicians with step-by-step AI-generated resolution instructions.', accent: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' },
              { icon: <ShieldCheck className="h-5 w-5" />, title: 'Smart Routing', desc: 'Tickets are automatically matched to the right specialist based on skills, availability, and urgency.', accent: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
              { icon: <Zap className="h-5 w-5" />,      title: 'Duplicate Detection', desc: 'AI clusters similar reports and merges them, reducing noise and preventing duplicate work orders.', accent: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
              { icon: <Clock className="h-5 w-5" />,    title: 'ETA Prediction', desc: 'Uses historical data to predict resolution times, keeping stakeholders informed automatically.', accent: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
              { icon: <TrendingUp className="h-5 w-5" />, title: 'Analytics Dashboard', desc: 'Track open, in-progress, and resolved tickets with real-time metrics and performance insights.', accent: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
            ].map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </motion.div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:pb-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-violet-600 to-cyan-600 px-6 py-12 text-center text-white shadow-glow-lg sm:p-12"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }}
            />
            <div className="pointer-events-none absolute top-[-60px] left-1/2 -translate-x-1/2 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl" />

            <h2 className="mb-4 text-2xl font-black tracking-tight sm:text-3xl lg:text-5xl">
              Ready to fix smarter?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-white/80 text-base sm:text-lg">
              Join teams using FixGenie AI to resolve issues faster, reduce costs, and keep every facility running.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="h-12 w-full rounded-full bg-white px-8 text-base font-bold text-primary hover:bg-white/90 hover:-translate-y-0.5 transition-all shadow-lg sm:w-auto">
                  Start for free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="ghost" className="h-12 w-full rounded-full border border-white/30 px-8 text-base font-semibold text-white hover:bg-white/10 sm:w-auto">
                  Sign in →
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <span>© {new Date().getFullYear()} FixGenie AI. All rights reserved.</span>
          </div>
        </footer>

      </main>
    </MotionConfig>
  );
}
