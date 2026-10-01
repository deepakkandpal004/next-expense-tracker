'use client';

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
    <main className="min-h-screen bg-bg-base">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/[0.06]">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimateInView>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-text-secondary">
              Contact & Support
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Get in touch with us.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-text-secondary leading-relaxed">
              Have a technical question, bug report, or feature request? We respond directly to every message.
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Contact Options */}
      <section className="relative bg-bg-base py-14 sm:py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Mail,
                title: 'Technical Support & Inquiries',
                description: 'Product support, account questions, and bugs',
                action: 'deepakkandpal.tech@gmail.com',
                href: 'mailto:deepakkandpal.tech@gmail.com',
                color: '#7585F8',
                bgColor: 'rgba(117,133,248,0.1)',
              },
              {
                icon: Mail,
                title: 'Business & Partnerships',
                description: 'Collaborations, integrations, and feedback',
                action: 'deepakkandpal.work@gmail.com',
                href: 'mailto:deepakkandpal.work@gmail.com',
                color: '#37C98C',
                bgColor: 'rgba(55,201,140,0.1)',
              },
              {
                icon: Clock,
                title: 'Response Timeline',
                description: 'Direct replies within 24 business hours',
                action: 'Mon–Fri · Regular updates',
                href: 'mailto:deepakkandpal.tech@gmail.com',
                color: '#F0B66A',
                bgColor: 'rgba(240,182,106,0.1)',
              },
            ].map((item, index) => (
              <AnimateInView key={item.action} delay={index * 0.05}>
                <div
                  className="group relative flex h-full flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 transition-colors hover:border-white/[0.14]"
                >
                  <div
                    className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08]"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <item.icon size={18} style={{ color: item.color }} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 flex-1 text-xs text-text-secondary leading-relaxed">{item.description}</p>
                  <a
                    href={item.href}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors"
                  >
                    {item.action}
                    <ArrowRight size={13} />
                  </a>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Documentation Links */}
      <section className="relative bg-bg-base py-14 sm:py-20 border-b border-white/[0.06]">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimateInView className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Documentation & Guides
            </h2>
          </AnimateInView>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: HelpCircle,
                title: 'FAQ',
                description: 'Answers to common questions about features and calculations.',
                href: '/features',
                color: '#7585F8',
              },
              {
                icon: Shield,
                title: 'AI Transparency',
                description: 'Detailed explanation of summary-only data boundaries.',
                href: '/ai-transparency',
                color: '#A855F7',
              },
              {
                icon: Lock,
                title: 'Privacy Policy',
                description: 'How data encryption and deletion are enforced.',
                href: '/privacy',
                color: '#37C98C',
              },
              {
                icon: FileText,
                title: 'Core Features',
                description: 'Explore the full architectural breakdown.',
                href: '/features',
                color: '#F0B66A',
              },
            ].map((item, index) => (
              <AnimateInView key={item.title} delay={index * 0.04}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.14]"
                >
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]"
                  >
                    <item.icon size={16} style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">{item.description}</p>
                  </div>
                </Link>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
