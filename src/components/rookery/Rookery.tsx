import { useState } from 'react';
import './rookery.css';

type RavenStatus = 'ready' | 'away' | 'resting';
type Raven = { id: string; name: string; speed: string; status: RavenStatus; statusLabel: string; detail: string; image: string; };

const ravens: Raven[] = [
  { id: 'phantom', name: 'Phantom Raven', speed: 'Instant', status: 'ready', statusLabel: 'Ready', detail: 'Available to carry a letter.', image: '/assets/ravens/web/phantom-raven.webp' },
  { id: 'swift', name: 'Swift Raven', speed: '500 km/h', status: 'away', statusLabel: 'Away', detail: 'Returning in 2h 17m.', image: '/assets/ravens/web/swift-raven.webp' },
  { id: 'courier', name: 'Courier Raven', speed: '250 km/h', status: 'ready', statusLabel: 'Ready', detail: 'Available to carry a letter.', image: '/assets/ravens/web/courier-raven.webp' },
  { id: 'wanderer', name: 'Wanderer Raven', speed: '100 km/h', status: 'resting', statusLabel: 'Resting', detail: 'Ready in 1h 24m.', image: '/assets/ravens/web/wanderer-raven.webp' },
  { id: 'old', name: 'Old Raven', speed: '50 km/h', status: 'ready', statusLabel: 'Ready', detail: 'Available to carry a letter.', image: '/assets/ravens/web/old-raven.webp' },
];

export default function Rookery() {
  const [selectedId, setSelectedId] = useState('phantom');
  const selected = ravens.find((raven) => raven.id === selectedId) ?? ravens[0]!;
  return (
    <div className="rookery-app">
      <main id="rookery-main" className="rookery-main">
        <section className="rookery-wall" aria-labelledby="rookery-title">
          <div className="wall-vines wall-vines-left" aria-hidden="true" />
          <div className="wall-vines wall-vines-right" aria-hidden="true" />
          <header className="rookery-title-wrap">
            <div className="parchment-title"><span aria-hidden="true">‹</span><h1 id="rookery-title">My Rookery</h1><span aria-hidden="true">›</span></div>
            <p><strong>3</strong> ready · <strong>1</strong> away · <strong>1</strong> resting</p>
          </header>
          <div className="roost-grid" aria-label="Your five ravens">
            {ravens.map((raven) => <RavenBay key={raven.id} raven={raven} selected={raven.id === selectedId} onSelect={() => setSelectedId(raven.id)} />)}
          </div>
          <section className="keeper-ledger" aria-live="polite" aria-label="Selected raven details">
            <div><span className="ledger-kicker">Selected raven</span><strong>{selected.name}</strong></div>
            <p>{selected.speed} · {selected.detail}</p>
            <a className={selected.status === 'ready' ? 'ledger-action' : 'ledger-action disabled'} href={selected.status === 'ready' ? '/write' : undefined} aria-disabled={selected.status !== 'ready'}>{selected.status === 'ready' ? 'Write with this raven' : selected.statusLabel}</a>
          </section>
          <a className="write-letter-banner" href="/write"><FeatherIcon /><span>Write a Letter</span><span className="banner-seal" aria-hidden="true">R</span></a>
        </section>
      </main>
    </div>
  );
}

function RavenBay({ raven, selected, onSelect }: { raven: Raven; selected: boolean; onSelect: () => void }) {
  const isAtRookery = raven.status === 'ready' || raven.status === 'resting';
  return <article className={`raven-bay bay-${raven.id}`}><button type="button" className="bay-select" aria-pressed={selected} aria-label={`Select ${raven.name}, ${raven.statusLabel}, ${raven.detail}`} onClick={onSelect}>
    <span className="stone-arch" aria-hidden="true"><span className="arch-opening"><span className="nest-straw" />{isAtRookery && <><span className="raven-contact-shadow" /><img className="raven-art" data-raven={raven.id} src={raven.image} alt="" width="800" height="731" loading={raven.id === 'wanderer' || raven.id === 'old' ? 'lazy' : 'eager'} /></>}<span className="wood-perch" /><span className="perch-front" /></span></span>
    <span className="raven-plaque"><strong>{raven.name}</strong><span><WingIcon /> {raven.speed}</span></span>
    <span className={`status-plaque status-${raven.status}`}><StatusIcon status={raven.status} /><span><strong>{raven.statusLabel}</strong><small>{raven.status === 'ready' ? '' : raven.detail}</small></span></span>
  </button></article>;
}
function Icon({ children }: { children: React.ReactNode }) { return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{children}</svg>; }
function FeatherIcon() { return <Icon><path d="M19.5 4.5c-5.7.4-10 3.1-12.8 8.2L5 19l6.3-1.8c4.8-3 7.5-7.2 8.2-12.7ZM6.2 17.7l8.9-8.8M9.5 14.2l-2.2-.5M12.7 11l-.3-2.2" /></Icon>; }
function WingIcon() { return <Icon><path d="M3 13c5.5 1.5 9-.2 12-5-1 4.5-3.8 7.5-8.5 9M7 17c4.8 1 8.7-.5 12-4.5" /></Icon>; }
function StatusIcon({ status }: { status: RavenStatus }) { if (status === 'ready') return <Icon><path d="m5 12 4 4L19 6" /></Icon>; if (status === 'resting') return <Icon><path d="M7 3h10M7 21h10M8 4c0 4 3 4.5 4 6 1-1.5 4-2 4-6M8 20c0-4 3-4.5 4-6 1 1.5 4 2 4 6" /></Icon>; return <Icon><path d="m5 14 5-5v3c4-.5 7 1 9 5-3-2-6-2-9-1v3l-5-5Z" /></Icon>; }
