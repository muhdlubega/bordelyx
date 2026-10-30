'use client';
import dynamic from 'next/dynamic';
import { Component, useState, type ReactNode } from 'react';
import Atlas from './Atlas';
import type { Run } from '@/lib/engine';
const MapboxAtlas = dynamic(() => import('./MapboxAtlas'), { ssr: false });
type Props = {
    run?: Run;
    onSelect?: (id: string) => void;
    decorative?: boolean;
};
class AtlasBoundary extends Component<{
    children: ReactNode;
    fallback: ReactNode;
}, {
    failed: boolean;
}> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
/** The bundled SVG atlas is the default; a token opts into the interchangeable WebGL renderer. */
export default function GameAtlas(props: Props) {
    const [failed, setFailed] = useState(false);
    const restricted = props.run?.status === 'playing' && props.run.modifiers.some(m => ['blind', 'fog', 'noLabels'].includes(m));
    const fallback = <Atlas {...props}/>;
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || failed || restricted || props.decorative)
        return fallback;
    return <AtlasBoundary fallback={fallback}><MapboxAtlas run={props.run} onSelect={props.onSelect} onError={() => setFailed(true)}/></AtlasBoundary>;
}
