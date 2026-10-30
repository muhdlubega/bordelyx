export function Icon({ name, size = 24 }: {
    name: string;
    size?: number;
}) {
    const paths: Record<string, React.ReactNode> = {
        globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5h14M5 17.5h14"/></>,
        royale: <><path d="m3 7 4 4 5-8 5 8 4-4-2 12H5Z"/><path d="M8 22h8"/></>,
        heist: <><path d="m12 2 9 5v10l-9 5-9-5V7Z"/><path d="m3 7 9 5 9-5M12 12v10M7 4l10 6"/></>,
        rush: <><path d="m14 2-9 12h7l-2 8 10-12h-7Z"/></>,
        chain: <><path d="m9 15 6-6M8 17l-2 2a4 4 0 0 1-5-5l5-5a4 4 0 0 1 5 0M16 7l2-2a4 4 0 0 1 5 5l-5 5a4 4 0 0 1-5 0"/></>,
        escape: <><path d="M13 3h7v18h-7M3 12h13m-5-5 5 5-5 5"/></>,
        ghost: <><circle cx="5" cy="17" r="3"/><circle cx="19" cy="6" r="3"/><path d="M8 17h3m2-3 2-3m1-3 1-1" strokeDasharray="1 2"/></>,
        pinpoint: <><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/></>,
        dash: <><path d="m10 3-5 10h7l-2 8 10-12h-8l4-6M1 8h4M1 17h4"/></>,
        shield: <><path d="m12 2 8 4v6q0 7-8 10-8-3-8-10V6Z"/><path d="m8 12 3 3 5-6"/></>,
        scout: <><path d="m12 2 9 19-9-5-9 5Z"/><path d="M12 7v9"/></>,
        reroute: <><path d="M4 7h12l-4-4m4 4-4 4M20 17H8l4 4m-4-4 4-4"/></>,
        pulse: <><circle cx="12" cy="12" r="3"/><path d="M7 5a9 9 0 0 0 0 14M17 5a9 9 0 0 1 0 14M3 2a14 14 0 0 0 0 20M21 2a14 14 0 0 1 0 20"/></>,
        flame: <path d="M13 2c2 7-4 7-2 12 2-1 4-3 4-6 9 8 4 14-3 14S0 15 6 8c-1 4 1 5 2 5-1-5 5-6 5-11Z"/>,
        trophy: <><path d="M6 3h12v8a6 6 0 0 1-12 0ZM6 5H2v4q0 5 5 5M18 5h4v4q0 5-5 5M12 17v5m-5 0h10"/></>,
        arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
        close: <path d="m5 5 14 14M5 19 19 5"/>,
        sound: <><path d="M4 9h4l6-5v16l-6-5H4ZM18 7q6 5 0 10"/></>,
        clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
        star: <path d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"/>,
    };
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.globe}</svg>;
}
