'use client';

import { useId, useState } from 'react';
import { Card, LinkButton, SectionHeader } from '@/components/ui';

const capabilities = [
  ['Record transactions', 'Add income and expense records with dates, descriptions, amounts, and categories.'],
  ['Review reporting periods', 'Use the dashboard, records, and chart views to review the same selected period.'],
  ['Explore recorded data', 'Review trends, category totals, and an accessible data-table alternative for charts.'],
  ['Use optional AI assistance', 'Request category suggestions and period-scoped interpretations with clear disclosures.'],
] as const;
const pageClass = 'content-frame py-12 sm:py-16 lg:py-20';
const gridClass = 'mt-8 grid gap-4 sm:grid-cols-2';

function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <header className='max-w-3xl'><p className='text-interface-sm font-semibold text-primary'>{eyebrow}</p><h1 className='mt-3 text-display-lg font-semibold text-foreground'>{title}</h1><div className='mt-4 text-interface-md text-foreground-secondary'>{children}</div></header>;
}
function CapabilityGrid() {
  return <div className={gridClass}>{capabilities.map(([title, description]) => <div className='rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10' key={title}><h3 className='text-interface-md font-semibold'>{title}</h3><p className='mt-2 text-interface-sm text-foreground-secondary'>{description}</p></div>)}</div>;
}
function Actions({ primary = 'Create an account' }: { primary?: string }) {
  return <div className='mt-7 flex flex-col gap-3 sm:flex-row'><LinkButton href='/sign-up' label={primary} /><LinkButton href='/features' intent='secondary' label='Explore features' /></div>;
}
const questions = [
  ['What can I record?', 'Expense AI lets you create income and expense records with the details needed for reporting.'],
  ['How is AI used?', 'AI-assisted category suggestions and insights are optional. The product labels generated output and links to its data-use disclosure.'],
  ['Does an AI suggestion change my record automatically?', 'No. Category suggestions require your confirmation or replacement before the record is saved.'],
] as const;
function Faq() {
  const [open, setOpen] = useState<number | null>(null); const baseId = useId();
  return <section aria-labelledby='landing-faq' className='border-t border-border bg-surface-subtle'><div className={pageClass}><SectionHeader title='Frequently asked questions' description='Answers about the product capabilities available today.' /><div className='mt-6 grid gap-3'>{questions.map(([question, answer], index) => { const id = `${baseId}-${index}`; const expanded = open === index; return <Card key={question} className='p-0'><h3><button aria-controls={id} aria-expanded={expanded} className='flex min-h-11 w-full items-center justify-between gap-4 px-4 py-3 text-left text-interface-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus' onClick={() => setOpen(expanded ? null : index)} type='button'>{question}<span aria-hidden='true'>{expanded ? '−' : '+'}</span></button></h3>{expanded ? <div className='border-t border-border px-4 py-3 text-interface-sm text-foreground-secondary' id={id} role='region'>{answer}</div> : null}</Card>; })}</div></div></section>;
}

export function LandingPageContent() {
  return <main><section className='public-hero border-b border-border'><div className={pageClass}><PageIntro eyebrow='Expense AI' title='Understand the financial records you create.'><p>Record transactions, review reporting periods, and use optional AI assistance to explore patterns in your recorded data.</p></PageIntro><Actions /></div></section><section aria-labelledby='product-evidence'><div className={pageClass}><SectionHeader title='Product evidence' description='The interface below is an illustrative product example, not live account data.' /><div className='rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10 mt-8 bg-surface-subtle'><div className='grid gap-4 sm:grid-cols-3'>{['Recorded spending', 'Category distribution', 'AI insight label'].map((label) => <div className='rounded-control border border-border bg-surface p-4' key={label}><p className='text-interface-xs text-foreground-secondary'>Illustrative interface</p><p className='mt-2 font-semibold'>{label}</p></div>)}</div><figcaption className='mt-4 text-interface-sm text-foreground-secondary'>Example dashboard elements reflect the available transaction, chart, and optional AI features.</figcaption></div></div></section><section aria-labelledby='landing-capabilities'><div className={pageClass}><SectionHeader title='Core capabilities' description='Tools for working with the information you choose to record.' /><CapabilityGrid /></div></section><section aria-labelledby='landing-workflow' className='border-y border-border bg-surface-subtle'><div className={pageClass}><SectionHeader title='A simple workflow' /><ol className='mt-6 grid gap-4 sm:grid-cols-3'>{['Create an account', 'Record a transaction', 'Review the selected period'].map((step, index) => <li className='rounded-container border border-border bg-surface p-4' key={step}><span className='text-interface-xs font-semibold text-primary'>Step {index + 1}</span><p className='mt-2 font-semibold'>{step}</p></li>)}</ol></div></section><Faq /><section className='public-hero'><div className={pageClass}><SectionHeader title='Start with your records' description='Create an account to begin recording transactions and reviewing your own information.' /><Actions /></div></section></main>;
}


export function FeaturesPageContent() {
  return <main className={pageClass}><PageIntro eyebrow='Features' title='Tools built around your recorded information.'><p>Expense AI provides transaction entry, reporting-period views, charts, records management, and optional AI assistance.</p></PageIntro><CapabilityGrid /><section className='mt-12' aria-labelledby='feature-workflow'><SectionHeader title='How the features work together' /><ol className='mt-6 grid gap-4 md:grid-cols-3'>{['Enter a record', 'Select a reporting period', 'Review the resulting dashboard, records, and charts'].map((step, index) => <div className='rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10' key={step}><p className='text-interface-xs font-semibold text-primary'>Step {index + 1}</p><h3 className='mt-2 font-semibold'>{step}</h3></div>)}</ol></section><section className='mt-12 border-t border-border pt-8'><SectionHeader title='AI assistance is optional' description='AI features use period-scoped financial summaries as described in the AI transparency notice. Generated output is informational, not professional financial advice.' /><Actions /></section></main>;
}

export function AboutPageContent() {
  return <main className={pageClass}><PageIntro eyebrow='About Expense AI' title='A focused workspace for expense tracking.'><p>Expense AI helps people record financial activity and examine the reports derived from those records. Optional AI features are kept distinct from recorded-data views.</p></PageIntro><section className='mt-12'><SectionHeader title='What we focus on' /><div className={gridClass}><Card><h2 className='font-semibold'>Clear records</h2><p className='mt-2 text-interface-sm text-foreground-secondary'>Create, view, filter, and export the transactions in your selected reporting scope.</p></Card><Card><h2 className='font-semibold'>Transparent assistance</h2><p className='mt-2 text-interface-sm text-foreground-secondary'>AI output is labeled and accompanied by an explanation of the data used for the request.</p></Card></div></section><Actions /></main>;
}

export function ContactPageContent() {
  return <main className={pageClass}><PageIntro eyebrow='Contact Expense AI' title='Get in touch with support.'><p>Use one of the links below for account, product, or accessibility questions.</p></PageIntro><div className={gridClass}><Card><h2 className='font-semibold'>Email support</h2><a className='mt-3 inline-block text-primary underline underline-offset-4' href='mailto:dkandpal757@gmail.com'>Email dkandpal757@gmail.com</a></Card><Card><h2 className='font-semibold'>Phone support</h2><a className='mt-3 inline-block text-primary underline underline-offset-4' href='tel:+919123495043'>Call +91 91234 95043</a></Card><Card className='sm:col-span-2'><h2 className='font-semibold'>Support hours</h2><p className='mt-2 text-interface-sm text-foreground-secondary'>Monday–Friday, 9:00 AM–6:00 PM Pacific Standard Time (UTC−08:00).</p></Card></div></main>;
}

export function PrivacyPageContent() {
  return <main className={pageClass}><PageIntro eyebrow='Privacy' title='Privacy information for Expense AI.'><p>Expense AI stores account and transaction information needed to provide the authenticated product experience. The app keeps records scoped to the signed-in user.</p></PageIntro><section className='mt-12 grid gap-4'><Card><h2 className='font-semibold'>Your records</h2><p className='mt-2 text-interface-sm text-foreground-secondary'>Transaction records are used to present your dashboard, records, charts, and exports for the selected reporting period.</p></Card><Card><h2 className='font-semibold'>Optional AI requests</h2><p className='mt-2 text-interface-sm text-foreground-secondary'>The AI transparency page identifies the approved period-scoped fields used when an optional AI request is made.</p></Card></section></main>;
}

export function AiTransparencyPageContent() {
  return <main className={pageClass}><PageIntro eyebrow='AI transparency' title='How optional AI assistance uses recorded data.'><p>AI-generated interpretations and recommendations are informational only and are not professional financial advice.</p></PageIntro><section className='mt-12 grid gap-4'><Card><h2 className='font-semibold'>Purpose</h2><p className='mt-2 text-interface-sm text-foreground-secondary'>Optional AI requests generate category suggestions and spending interpretations for the reporting period you select.</p></Card><Card><h2 className='font-semibold'>Disclosed fields</h2><p className='mt-2 text-interface-sm text-foreground-secondary'>Requests use reporting-period dates and label, currency, recorded transaction count, income, spending, balance, and category spending totals. Raw descriptions, IDs, and timestamps are excluded.</p></Card><Card><h2 className='font-semibold'>Provider retention</h2><p className='mt-2 text-interface-sm text-foreground-secondary'>Provider retention behavior has not been verified by the product owner.</p></Card></section></main>;
}
