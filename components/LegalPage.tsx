import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import SiteFooter from '@/components/SiteFooter';

type Props = { title: string; summary: string; children: ReactNode };

export default function LegalPage({ title, summary, children }: Props) {
  return (
    <div className="app legal-shell">
      <header className="site-header legal-nav">
        <Link className="brand" href="/" aria-label="Bordelyx home">
          <span className="brand-mark"><Icon name="globe" size={28} /></span>
          bordelyx<span className="brand-dot">®</span>
        </Link>
        <Link className="legal-back" href="/">← Back to the arcade</Link>
      </header>
      <main className="legal-page">
        <header className="legal-header">
          <span className="eyebrow">Bordelyx</span>
          <h1>{title}</h1>
          <p>{summary}</p>
          <span className="legal-updated">Last updated: 30 October 2026</span>
        </header>
        <article className="legal-content">{children}</article>
      </main>
      <SiteFooter />
    </div>
  );
}
