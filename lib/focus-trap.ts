const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** Ref callback for a dialog container: moves focus in, traps Tab, restores focus on unmount. */
export function trapFocus(node: HTMLElement | null) {
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;
    const items = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null);
    if (!node.hasAttribute('tabindex')) node.tabIndex = -1;
    (items().find(el => !el.classList.contains('modal-close')) ?? node).focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const list = items();
        if (!list.length) { e.preventDefault(); return; }
        const first = list[0], last = list[list.length - 1], active = document.activeElement;
        if (e.shiftKey && (active === first || active === node)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    node.addEventListener('keydown', onKey);
    return () => { node.removeEventListener('keydown', onKey); previous?.focus?.({ preventScroll: true }); };
}
