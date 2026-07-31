'use client';

import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, Download, GalleryVerticalEnd, ShieldCheck, Sparkles, Trash2
} from 'lucide-react';

import { STYLE_BY_ID } from '../data/catalog';
import { listProviders } from '../lib/ai';
import { usePersistentState, useRevealRoot } from '../lib/hooks';
import { Button, Compare, GoArrow, Reveal, Toggle, Wordmark } from './ui';

/* -------------------------------------------------------------------------- */
/* Shared shell                                                                */
/* -------------------------------------------------------------------------- */

function PageShell({ eyebrow, title, copy, action, children, wide = false }) {
  const root = useRevealRoot();
  return (
    <div className="page" ref={root}>
      <header className="page__bar">
        <Link to="/" className="page__back">
          <ArrowLeft /> <span>Home</span>
        </Link>
        <Wordmark tagline="" to={null} />
        <Button to="/studio" variant="gilt" size="sm">
          Launch Studio <GoArrow />
        </Button>
      </header>

      <main className={wide ? 'page__body page__body--wide' : 'page__body'}>
        <Reveal className="page__head">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            {copy && <p className="lede">{copy}</p>}
          </div>
          {action}
        </Reveal>
        {children}
      </main>
    </div>
  );
}

function Empty({ title, copy }) {
  return (
    <Reveal className="page__empty">
      <span>
        <GalleryVerticalEnd />
      </span>
      <h2>{title}</h2>
      <p>{copy}</p>
      <Button to="/studio">
        Open the Studio <GoArrow />
      </Button>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/* Lookbook                                                                    */
/* -------------------------------------------------------------------------- */

export function Lookbook() {
  const [saved, setSaved] = usePersistentState('muse-lookbook-v3', { looks: [] });
  const navigate = useNavigate();

  const remove = (id) => setSaved((prev) => ({ looks: prev.looks.filter((l) => l.id !== id) }));

  const download = (look) => {
    const link = document.createElement('a');
    link.href = look.image;
    link.download = `Musè-${look.styleId}.jpg`;
    link.click();
  };

  return (
    <PageShell
      wide
      eyebrow="Your lookbook"
      title="Kept looks"
      copy="Every result you decided to keep, held side by side against the original so you can compare them properly."
      action={
        <Button to="/studio" variant="outline">
          Create another <GoArrow />
        </Button>
      }
    >
      {!saved.looks.length ? (
        <Empty
          title="Nothing kept yet"
          copy="Generate a look in the studio and press Keep. It will show up here with its before and after."
        />
      ) : (
        <div className="lookbook">
          {saved.looks.map((look, i) => (
            <Reveal key={look.id} kind="up" delay={i * 70} className="lookcard card">
              <Compare
                before={look.original}
                after={look.image}
                beforeLabel="Original"
                afterLabel="Musè"
                start={50}
                className="lookcard__compare"
              />
              <div className="lookcard__body">
                <div>
                  <h3>{look.styleName || STYLE_BY_ID[look.styleId]?.name || 'Saved look'}</h3>
                  <p>{look.created}</p>
                </div>
                <div className="lookcard__actions">
                  <button onClick={() => download(look)} aria-label="Download">
                    <Download />
                  </button>
                  <button onClick={() => remove(look.id)} aria-label="Remove from lookbook">
                    <Trash2 />
                  </button>
                </div>
              </div>
              <button className="lookcard__open" onClick={() => navigate('/studio')}>
                Refine this look <GoArrow />
              </button>
            </Reveal>
          ))}
        </div>
      )}
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

const DEFAULT_SETTINGS = {
  provider: 'demo',
  quality: 'High fidelity',
  tips: true,
  privateMode: true
};

export function Settings() {
  const [settings, setSettings] = usePersistentState('muse-settings-v3', DEFAULT_SETTINGS);
  const providers = useMemo(() => listProviders(), []);
  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const active = providers.find((p) => p.id === settings.provider);

  return (
    <PageShell
      eyebrow="Studio controls"
      title="Settings"
      copy="Choose the generation engine, output quality and how much guidance the studio offers."
    >
      <Reveal className="settings card">
        <h2>Generation engine</h2>
        <p className="settings__note">
          The demo engine runs entirely on this device and needs no key. The remaining adapters are
          wired for a server-side model and will report as unavailable until one is connected.
        </p>

        <div className="providers">
          {providers.map((provider) => (
            <label key={provider.id} className={`provider ${settings.provider === provider.id ? 'is-active' : ''}`}>
              <input
                type="radio"
                name="provider"
                value={provider.id}
                checked={settings.provider === provider.id}
                onChange={() => set('provider', provider.id)}
              />
              <span className="provider__body">
                <strong>{provider.label}</strong>
                <small>
                  {provider.requiresKey ? 'Needs server credentials' : 'Runs on this device'}
                </small>
                <span className="provider__caps">
                  {Object.entries(provider.capabilities)
                    .filter(([, on]) => on)
                    .map(([cap]) => (
                      <em key={cap}>{cap}</em>
                    ))}
                </span>
              </span>
              {settings.provider === provider.id && <Check className="provider__tick" />}
            </label>
          ))}
        </div>

        {active?.requiresKey && (
          <p className="settings__warn">
            <ShieldCheck /> This adapter is not implemented in this build. See{' '}
            <code>app/api/generate/route.js</code> for the contract and{' '}
            <code>src/lib/ai/providers/</code> for where to add it.
          </p>
        )}
      </Reveal>

      <Reveal kind="up" delay={80} className="settings card">
        <h2>Studio experience</h2>
        <label className="setting-row">
          <span>
            <strong>Preview quality</strong>
            <small>Controls the render resolution and how long generation takes.</small>
          </span>
          <select value={settings.quality} onChange={(e) => set('quality', e.target.value)}>
            <option>Fast preview</option>
            <option>Balanced</option>
            <option>High fidelity</option>
          </select>
        </label>

        <div className="setting-row">
          <span>
            <strong>Private browser storage</strong>
            <small>Keep portraits and saved looks on this device only.</small>
          </span>
          <Toggle on={settings.privateMode} onChange={(v) => set('privateMode', v)} label="Private browser storage" />
        </div>

        <div className="setting-row">
          <span>
            <strong>Stylist guidance</strong>
            <small>Show tips and photo advice throughout the workflow.</small>
          </span>
          <Toggle on={settings.tips} onChange={(v) => set('tips', v)} label="Stylist guidance" />
        </div>
      </Reveal>

      <Reveal kind="up" delay={140} className="settings card">
        <h2>Your data</h2>
        <p className="settings__note">
          Portraits, saved looks and preferences live in this browser's local storage. Clearing them
          is immediate and cannot be undone.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            ['muse-studio-v3', 'muse-lookbook-v3', 'muse-settings-v3'].forEach((key) => {
              try {
                localStorage.removeItem(key);
              } catch {
                /* ignore */
              }
            });
            window.location.assign('/');
          }}
        >
          <Trash2 /> Clear everything stored locally
        </Button>
      </Reveal>
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Help                                                                       */
/* -------------------------------------------------------------------------- */

const HELP = [
  {
    n: '01',
    title: 'Start with the right photograph',
    copy:
      'One person, facing the camera, whole hairline visible, even light. The portrait check in the studio tells you specifically what to fix rather than failing silently.'
  },
  {
    n: '02',
    title: 'Browse visually, not by name',
    copy:
      'Every category shows previews rather than a list of words. Tap a card to load it. Nothing is applied until you press Generate, so exploring costs nothing.'
  },
  {
    n: '03',
    title: 'Colour is live, geometry is a render',
    copy:
      'Hair colour redraws on your own photograph instantly and on device. Changing the cut itself needs a synthesis model, which is why it runs as a separate generation step.'
  },
  {
    n: '04',
    title: 'Compare before you commit',
    copy:
      'Drag the divider across the result, zoom in on the hairline, and switch to full screen. Keep the variants that work in your lookbook and discard the rest.'
  },
  {
    n: '05',
    title: 'Take the brief to your stylist',
    copy:
      'Each result carries its cut name, length, texture, volume, fade height and colour technique in professional vocabulary, so the conversation starts from something precise.'
  },
  {
    n: '06',
    title: 'Connecting a real model',
    copy:
      'The build ships with a working on-device demo engine and typed adapters for hosted models. Implement app/api/generate/route.js and pick the adapter in Settings.'
  }
];

export function Help() {
  return (
    <PageShell
      eyebrow="Musè concierge"
      title="Help centre"
      copy="How to get a result you can actually act on, and what the preview does and does not promise."
    >
      <div className="help">
        {HELP.map((item, i) => (
          <Reveal key={item.n} kind="up" delay={i * 60} className="help__card card">
            <span>{item.n}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </Reveal>
        ))}
      </div>

      <Reveal kind="up" className="help__cta card">
        <Sparkles />
        <div>
          <h3>Still stuck?</h3>
          <p>The fastest way to understand the studio is to run one look end to end with a demo model.</p>
        </div>
        <Button to="/studio">
          Try a demo model <GoArrow />
        </Button>
      </Reveal>
    </PageShell>
  );
}
