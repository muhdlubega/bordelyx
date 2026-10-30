import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Bordelyx — The world is your playground', description: 'Cross borders. Outsmart danger. A geography strategy arcade with seven ways to play and a new World Circuit every day.' };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en"><body>{children}</body></html>; }
