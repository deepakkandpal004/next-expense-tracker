'use client';

import { motion } from 'motion/react';
import {
  ArrowRight,
  Clock,
  FileText,
  HelpCircle,
  Lock,
  Mail,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { AnimateInView } from './shared';

export function ContactPageContent() {
  return (
    <main className="min-h-screen bg-[#0B0F14]">
      {/* Hero */}
      <section className="relative overflow-hidden py-32 sm:py-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#00DCE5]/[0.03] blur-[150px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <AnimateInView>
            <h1 className="text-6xl font-semibold tracking-tight text-white sm:text-7xl md:text-8xl">
              Get in touch
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-[#9AA3AF]">
              Have a question, need support, or want to share feedback?
              We&apos;d love to hear from you.
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Contact Options */}
      <section className="relative border-y border-white/[0.06] bg-[#080C10] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Mail,
                title: 'Email',
                description: 'For account, product, or accessibility questions',
                action: 'deepakkandpal.tech@gmail.com',
                href: 'mailto:deepakkandpal.tech@gmail.com',
                color: '#00DCE5',
                bgColor: 'rgba(0,220,229,0.08)',
              },
              {
                icon: Mail,
                title: 'Email',
                description: 'For partnerships or business inquiries',
                action: 'deepakkandpal.work@gmail.com',
                href: 'mailto:deepakkandpal.work@gmail.com',
                color: '#A855F7',
                bgColor: 'rgba(168,85,247,0.08)',
              },
              {
                icon: Clock,
                title: 'Support Hours',
                description: 'When our team is available',
                action: 'Mon–Fri, 9AM–6PM PST',
                href: '#',
                color: '#22C55E',
                bgColor: 'rgba(34,197,94,0.08)',
              },
            ].map((item, index) => (
              <AnimateInView key={item.action} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <div
                    className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ backgroundColor: item.bgColor }}
                  />
                  <div className="relative z-10">
                    <div
                      className="flex size-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      <item.icon size={24} style={{ color: item.color }} />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-[#9AA3AF]">{item.description}</p>
                    <a
                      href={item.href}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:opacity-80"
                      style={{ color: item.color }}
                    >
                      {item.action}
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </motion.div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="relative overflow-hidden bg-[#0B0F14] py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#A855F7]/[0.03] blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimateInView className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#A855F7]/60">Resources</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Find answers fast
            </h2>
          </AnimateInView>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: HelpCircle,
                title: 'FAQ',
                description: 'Answers to common questions about Expense Tracker AI.',
                href: '/features',
                color: '#00DCE5',
              },
              {
                icon: Shield,
                title: 'AI Transparency',
                description: 'Learn how our AI features use your data.',
                href: '/ai-transparency',
                color: '#A855F7',
              },
              {
                icon: Lock,
                title: 'Privacy Policy',
                description: 'How we protect and handle your information.',
                href: '/privacy',
                color: '#22C55E',
              },
              {
                icon: FileText,
                title: 'Features',
                description: 'Explore everything Expense Tracker AI can do.',
                href: '/features',
                color: '#FBBF24',
              },
            ].map((item, index) => (
              <AnimateInView key={item.title} delay={index * 0.08}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon size={20} style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-[#00DCE5] transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#9AA3AF]">{item.description}</p>
                  </div>
                </Link>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#080C10] py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00DCE5]/[0.04] blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <AnimateInView>
            <h2 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[#9AA3AF]">
              Join thousands who track smarter with Expense Tracker AI.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="group flex items-center gap-2.5 rounded-xl bg-[#00DCE5] px-8 py-4 text-sm font-semibold text-[#0B0F14] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,220,229,0.4)] hover:scale-[1.03] active:scale-[0.97]"
              >
                Get started free
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/"
                className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.97]"
              >
                Back to home
              </Link>
            </div>
          </AnimateInView>
        </div>
      </section>
    </main>
  );
}
