import type { Metadata } from 'next';
import { Geist, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Starfield from '@/components/Starfield';
const body = Geist({ subsets: ['latin'], variable: '--font-body-face', display: 'swap' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display-face', display: 'swap' });
export const metadata: Metadata = { title: 'Bordelyx — The world is your playground', description: 'Cross borders. Outsmart danger. A geography strategy arcade with seven ways to play and a new World Circuit every day.' };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en" className={`${body.variable} ${display.variable}`}><body><Starfield />{children}</body></html>; }
