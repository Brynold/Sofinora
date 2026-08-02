import { Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { businessConfig } from '../config/business';

export default function ContactPage() {
  const topic = new URLSearchParams(window.location.search).get('topic');
  const starterPackTopic = topic === 'starter-pack';
  const subject = encodeURIComponent(starterPackTopic ? 'Sofinora Starter Pack launch access' : 'Sofinora support request');
  const body = encodeURIComponent(starterPackTopic ? 'Hello, I would like launch access to the Sofinora Starter Pack.' : 'Hello Sofinora team,');
  const emailReady = Boolean(businessConfig.supportEmail);

  return (
    <article className="mx-auto w-full max-w-5xl py-8 sm:py-14">
      <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl sm:p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200"><MessageCircle size={24} /></div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Contact Sofinora</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {starterPackTopic ? 'Request Starter Pack launch access.' : 'How can we help?'}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">Questions about a calculator, the Starter Pack, or a purchase are welcome. Never send passwords, PINs, identity documents, or complete account statements.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <Mail className="text-cyan-600 dark:text-cyan-300" size={24} />
          <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Email support</h2>
          {emailReady ? (
            <>
              <p className="mt-3 text-slate-600 dark:text-slate-300">We aim to respond within two business days.</p>
              <a href={`mailto:${businessConfig.supportEmail}?subject=${subject}&body=${body}`} className="mt-5 inline-flex rounded-full bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">Email {businessConfig.supportEmail}</a>
            </>
          ) : (
            <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:bg-amber-400/10 dark:text-amber-100">Support email is being connected for launch. Please check back shortly.</p>
          )}
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <ShieldCheck className="text-emerald-600 dark:text-emerald-300" size={24} />
          <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">Privacy reminder</h2>
          <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">Describe the issue and calculator used, but replace sensitive financial information with approximate or example values.</p>
        </section>
      </div>
    </article>
  );
}
