'use client';

import Link from 'next/link';
import {Icon} from './Icon';

export default function SiteFooter({onHelp}:{onHelp?:()=>void}) {
  return <footer className="site-footer">
    <div className="footer-main">
      <Link href="/" className="brand" aria-label="Bordelyx home"><span className="brand-mark"><Icon name="globe" size={24}/></span>bordelyx<span className="brand-dot">®</span></Link>
      <nav className="footer-links" aria-label="Footer navigation">
        {onHelp ? <button onClick={onHelp}>How to play</button> : <Link href="/?help=1">How to play</Link>}
        <Link href="/privacy/">Privacy policy</Link>
        <Link href="/terms/">Terms of use</Link>
      </nav>
    </div>
    <div className="footer-meta">
      <p>3D globe by <a href="https://sketchfab.com/famousandfaded" target="_blank" rel="noopener noreferrer">famousandfaded</a> on <a href="https://sketchfab.com/3d-models/airports-around-the-world-e58f56a352b540469fd209abf0c37bc5" target="_blank" rel="noopener noreferrer">Sketchfab</a>.</p>
      <span>© 2026 Bordelyx</span>
    </div>
  </footer>;
}
