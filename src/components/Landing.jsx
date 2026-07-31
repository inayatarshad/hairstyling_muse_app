'use client';

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Aperture, ArrowRight, Check, Download, Gem, GitCompareArrows, Maximize2, Menu, Quote,
  ScanFace, Scissors, ShieldCheck, Sparkles, Sun, Upload, X, Zap
} from 'lucide-react';

import { ADVANTAGES, FAQ, SHOWCASE, STATS, STEPS, TESTIMONIALS } from '../data/content';
import { PHOTO_CELLS, STYLE_BY_ID, stylesFor } from '../data/catalog';
import StylePreview from './StylePreview';
import { Accordion, Button, Compare, GoArrow, Initials, Rating, Reveal, Segment, Wordmark } from './ui';
import {
  useActiveSection, useCountUp, useEscape, useParallax, useRevealRoot,
  useScrollLock, useScrolled, useScrollProgress, useSpotlight
} from '../lib/hooks';

const ICONS = {
  Aperture, Download, Gem, GitCompareArrows, Layers: GitCompareArrows, Maximize2,
  ScanFace, Scissors, ShieldCheck, Sparkles, Sun, Upload, Zap
};

const NAV_LINKS = [
  { id: 'process', label: 'How it works' },
  { id: 'styles', label: 'Styles' },
  { id: 'why', label: 'Why Musè' },
  { id: 'results', label: 'Results' },
  { id: 'faq', label: 'FAQ' }
];

/* ========================================================================== */
/* Navigation                                                                  */
/* ========================================================================== */

function LandingNav() {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(NAV_LINKS.map((l) => l.id));

  useScrollLock(open);
  useEscape(() => setOpen(false), open);

  return (
    <header className={`lnav ${scrolled ? 'is-stuck' : ''}`}>
      <div className="lnav__inner">
        <Wordmark />

        <nav className="lnav__links" aria-label="Sections">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? 'is-active' : ''}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="lnav__actions">
          <Button to="/studio" variant="gilt" size="sm">
            Launch Studio <GoArrow />
          </Button>
          <button
            className="lnav__burger"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu />
          </button>
        </div>
      </div>

      <div className={`lnav__drawer ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu">
        <button className="lnav__close" onClick={() => setOpen(false)} aria-label="Close menu">
          <X />
        </button>
        <nav>
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setOpen(false)}
              style={{ '--i': i }}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Button to="/studio" variant="gilt" block>
          Launch Studio <GoArrow />
        </Button>
      </div>
      {open && <button className="lnav__scrim" onClick={() => setOpen(false)} aria-label="Close menu" />}
    </header>
  );
}

/* ========================================================================== */
/* Hero                                                                       */
/* ========================================================================== */

function Hero() {
  const orbRef = useParallax(0.06);

  return (
    <section className="hero on-dark" id="top">
      <div className="hero__aurora" aria-hidden="true">
        <span className="aurora aurora--one" />
        <span className="aurora aurora--two" />
        <span className="aurora aurora--three" />
      </div>
      <div className="hero__ring" ref={orbRef} aria-hidden="true" />
      <div className="hero__grain" aria-hidden="true" />

      <div className="hero__inner shell-wide">
        <div className="hero__copy">
          <Reveal kind="up" className="eyebrow eyebrow--light" as="p">
            <Sparkles /> Personal style, visualised
          </Reveal>

          <Reveal kind="blur" delay={80}>
            <h1 className="hero__title">
              See your next look
              <br />
              <em className="display-em">before the cut.</em>
            </h1>
          </Reveal>

          <Reveal kind="up" delay={200}>
            <p className="lede lede--light hero__lede">
              Try considered hairstyles, beard shapes, and colour directions while preserving what
              makes you unmistakably you.
            </p>
          </Reveal>

          <Reveal kind="up" delay={300} className="hero__cta">
            <Button to="/studio" variant="light" size="lg">
              Upload your photo <GoArrow />
            </Button>
            <Button href="#results" variant="ghost-light" size="lg">
              Explore the reveal
            </Button>
          </Reveal>

        </div>

        <Reveal kind="scale" delay={160} className="hero__visual">
          <div className="hero__frame">
            <Compare
              before={SHOWCASE[0].before}
              after={SHOWCASE[0].after}
              beforeLabel=""
              afterLabel=""
              start={48}
              className="hero__compare"
            >
              <div className="hero__tag">
                <span>01</span>
                <p>
                  <small>SELECTED LOOK</small>
                  <strong>Layered Cut</strong>
                </p>
              </div>
              <div className="hero__identity">
                <span><ShieldCheck /></span>
                <p>
                  <small>IDENTITY LOCK</small>
                  <strong>Face &amp; expression preserved</strong>
                </p>
              </div>
            </Compare>
          </div>
        </Reveal>
      </div>

      <a className="hero__scroll" href="#process" aria-label="Scroll to how it works">
        <span />
      </a>
    </section>
  );
}

/* ========================================================================== */
/* Styling directions                                                         */
/* ========================================================================== */

const DIRECTIONS = [
  {
    label: 'Hair',
    title: 'Shape the silhouette.',
    copy: 'From precise crops to flowing layers, begin with a style and make every detail your own.',
    action: 'Explore hairstyles',
    to: '/studio'
  },
  {
    label: 'Beard',
    title: 'Refine the balance.',
    copy: 'Explore grooming directions that work with your face, haircut, and natural growth.',
    action: 'Explore grooming',
    to: '/studio'
  },
  {
    label: 'Colour',
    title: 'Find your tone.',
    copy: 'Build depth with natural foundations, highlights, balayage, and expressive colour.',
    action: 'Open colour studio',
    to: '/studio'
  }
];

function StylingDirections() {
  return (
    <section className="directions">
      <div className="shell-w directions__grid">
        {DIRECTIONS.map((item, index) => (
          <Reveal as="article" key={item.label} kind="up" delay={index * 80}>
            <span>{item.label}</span>
            <h2>{item.title}</h2>
            <p>{item.copy}</p>
            <Link to={item.to}>{item.action} <ArrowRight /></Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ========================================================================== */
/* How it works                                                                */
/* ========================================================================== */

function HowItWorks() {
  const railRef = useScrollProgress();

  return (
    <section className="section process on-dark" id="process">
      <div className="process__glow" aria-hidden="true" />
      <div className="shell-w">
        <div className="process__head">
          <Reveal as="p" className="eyebrow eyebrow--light">
            A considered process
          </Reveal>
          <Reveal kind="up" delay={80}>
            <h2 className="section-title">
              From curiosity
              <br />
              <em className="display-em">to clarity.</em>
            </h2>
          </Reveal>
          <Reveal kind="up" delay={160}>
            <p className="lede lede--light">
              Six steps, no guesswork, nothing technical to learn. Each one completes before the next
              begins so you always know where you are.
            </p>
          </Reveal>
        </div>

        <ol className="timeline" ref={railRef}>
          <span className="timeline__rail" aria-hidden="true">
            <i />
          </span>

          {STEPS.map((step, i) => {
            const Icon = ICONS[step.icon] || Sparkles;
            return (
              <Reveal
                as="li"
                key={step.n}
                kind={i % 2 ? 'left' : 'right'}
                delay={i * 90}
                className="timeline__item"
              >
                <span className="timeline__node" aria-hidden="true">
                  <Icon />
                </span>
                <div className="timeline__card glass glass--dark gilt-edge">
                  <small>STEP {step.n}</small>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* Style categories                                                            */
/* ========================================================================== */

const CATEGORY_TABS = [
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'beard', label: 'Beards' }
];

const CATEGORY_COUNT = {
  women: 'Twenty three women’s cuts and wave families wait inside the studio.',
  men: 'Thirteen men’s cuts, from a skin fade to a full pompadour.',
  beard: 'Thirteen beard shapes, from shadow stubble to a full Garibaldi.'
};

/**
 * The collection showcase runs on the real studio photography rather than the
 * illustrated previews. These are the portraits that ship with the app, cropped
 * out of their sprite sheets, so every card here is a genuine HD photograph.
 */
function StyleCategories() {
  const [tab, setTab] = useState('women');
  const sheet = PHOTO_CELLS[tab];

  return (
    <section className="section categories" id="styles">
      <div className="shell-w">
        <div className="categories__head">
          <div>
            <Reveal as="p" className="eyebrow">
              The collection
            </Reveal>
            <Reveal kind="up" delay={70}>
              <h2 className="section-title">
                Sixty looks,
                <br />
                <em className="display-em">one honest mirror.</em>
              </h2>
            </Reveal>
          </div>
          <Reveal kind="up" delay={140} className="categories__aside">
            <p className="lede">
              Cuts, colour, waves and beards, each one browsable as a picture rather than a word. Tap
              a look in the studio and it loads onto your portrait immediately.
            </p>
            <Segment options={CATEGORY_TABS} value={tab} onChange={setTab} ariaLabel="Style collection" />
          </Reveal>
        </div>

        <div className="photo-grid" key={tab}>
          {sheet.cells.map((cell, i) => {
            const style = STYLE_BY_ID[cell.id];
            return (
              <Reveal key={cell.id} kind="up" delay={i * 70} className="photo-card">
                <Link to="/studio" aria-label={`Try ${cell.name} in the studio`}>
                  {cell.landingImage ? (
                    <img className="photo-card__img" src={cell.landingImage} alt={`${cell.name} reference portrait`} />
                  ) : (
                    <span
                      className="photo-card__img"
                      style={{ backgroundImage: `url(${sheet.sheet})`, backgroundPosition: cell.pos }}
                      role="img"
                      aria-label={`${cell.name} reference portrait`}
                    />
                  )}
                  <span className="photo-card__body">
                    <strong>{cell.name}</strong>
                    {style?.meta && <em>{style.meta}</em>}
                  </span>
                  {style?.flags.includes('new') && <span className="badge badge--new photo-card__badge">New</span>}
                  {!style?.flags.includes('new') && style?.flags.includes('trending') && (
                    <span className="badge badge--hot photo-card__badge">Trending</span>
                  )}
                  <span className="photo-card__go" aria-hidden="true">
                    <ArrowRight />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal kind="up" className="categories__foot">
          <p>{CATEGORY_COUNT[tab]}</p>
          <Button to="/studio" variant="outline">
            Browse everything <GoArrow />
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* Why Musè                                                                    */
/* ========================================================================== */

function AdvantageCard({ item, index }) {
  const ref = useSpotlight();
  const Icon = ICONS[item.icon] || Sparkles;
  return (
    <Reveal kind="up" delay={index * 70} className="adv-card glass gilt-edge spotlight" ref={ref}>
      <span className="adv-card__icon">
        <Icon />
      </span>
      <h3>{item.title}</h3>
      <p>{item.copy}</p>
      <Check className="adv-card__tick" aria-hidden="true" />
    </Reveal>
  );
}

/** Counts up once it scrolls into view. */
function Stat({ stat, index }) {
  const [value, ref] = useCountUp(stat.value);
  return (
    <Reveal kind="up" delay={index * 80} className="stat">
      <strong ref={ref}>
        {value}
        {stat.suffix}
      </strong>
      <span>{stat.label}</span>
    </Reveal>
  );
}

function WhyUs() {
  return (
    <section className="section why" id="why">
      <div className="why__wash" aria-hidden="true" />
      <div className="shell-w">
        <div className="why__head">
          <Reveal as="p" className="eyebrow">
            Why Musè
          </Reveal>
          <Reveal kind="up" delay={70}>
            <h2 className="section-title">
              Built around the one thing
              <br />
              <em className="display-em">everything else gets wrong.</em>
            </h2>
          </Reveal>
          <Reveal kind="up" delay={140}>
            <p className="lede why__lede">
              Most tools show you a beautiful result that is no longer you. Musè treats your identity
              as the fixed point and the hair as the only variable.
            </p>
          </Reveal>
        </div>

        <div className="why__grid">
          {ADVANTAGES.map((item, i) => (
            <AdvantageCard key={item.title} item={item} index={i} />
          ))}
        </div>

        <div className="why__stats">
          {STATS.map((stat, i) => (
            <Stat key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* Results showcase                                                            */
/* ========================================================================== */

function Showcase() {
  // The male transformation, at the same portrait aspect as the hero. The
  // divider plus the caption below carry the meaning, so the pane labels are
  // dropped rather than repeated.
  const item = SHOWCASE.find((entry) => entry.id === 'boy') || SHOWCASE[0];

  return (
    <section className="section showcase on-dark" id="results">
      <div className="showcase__glow" aria-hidden="true" />
      <div className="shell-w">
        <div className="showcase__head">
          <Reveal as="p" className="eyebrow eyebrow--light">
            Real transformations
          </Reveal>
          <Reveal kind="up" delay={70}>
            <h2 className="section-title">
              Drag the line.
              <br />
              <em className="display-em">Judge for yourself.</em>
            </h2>
          </Reveal>
          <Reveal kind="up" delay={140}>
            <p className="lede lede--light">
              Same portrait, same lighting, same person. Only the hair moved. This is the exact
              comparison you get on your own photograph inside the studio.
            </p>
          </Reveal>
        </div>

        <Reveal kind="scale" className="showcase__stage">
          <Compare
            before={item.before}
            after={item.after}
            beforeLabel=""
            afterLabel=""
            start={44}
            className="showcase__compare"
          >
            <div className="showcase__tag">
              <span>02</span>
              <p>
                <small>SELECTED LOOK</small>
                <strong>{item.style}</strong>
              </p>
            </div>
          </Compare>
        </Reveal>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* Testimonials                                                                */
/* ========================================================================== */

function Testimonials() {
  return (
    <section className="section quotes">
      <div className="shell-w">
        <div className="quotes__head">
          <Reveal as="p" className="eyebrow">
            What people say
          </Reveal>
          <Reveal kind="up" delay={70}>
            <h2 className="section-title">
              Trusted by the people
              <br />
              <em className="display-em">who do this for a living.</em>
            </h2>
          </Reveal>
        </div>

        <div className="quotes__grid">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} kind="up" delay={i * 80} className="quote-card card lift">
              <Quote className="quote-card__mark" aria-hidden="true" />
              <Rating value={t.rating} />
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <Initials name={t.name} tone={t.tone} />
                <span>
                  <strong>{t.name}</strong>
                  <small>{t.role}</small>
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* FAQ                                                                         */
/* ========================================================================== */

function Faq() {
  return (
    <section className="section faq" id="faq">
      <div className="shell-w faq__inner">
        <div className="faq__aside">
          <Reveal as="p" className="eyebrow">
            Questions
          </Reveal>
          <Reveal kind="up" delay={70}>
            <h2 className="section-title">
              Everything worth
              <br />
              <em className="display-em">asking first.</em>
            </h2>
          </Reveal>
          <Reveal kind="up" delay={140}>
            <p className="lede">
              Straight answers on privacy, accuracy and what the preview can and cannot promise.
            </p>
          </Reveal>
          <Reveal kind="up" delay={200} className="faq__cta">
            <Button to="/studio" variant="outline">
              Try it instead <GoArrow />
            </Button>
          </Reveal>
        </div>

        <Reveal kind="up" delay={100} className="faq__list">
          <Accordion items={FAQ} />
        </Reveal>
      </div>
    </section>
  );
}

/* ========================================================================== */
/* Final CTA + footer                                                          */
/* ========================================================================== */

function FinalCta() {
  return (
    <section className="final on-dark">
      <div className="final__glow" aria-hidden="true" />
      <div className="final__rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="shell-w final__inner">
        <Reveal as="p" className="eyebrow eyebrow--light">
          <Sparkles /> Your next look is one photo away
        </Reveal>
        <Reveal kind="blur" delay={80}>
          <h2 className="final__title">
            Ready to meet
            <br />
            <em className="shimmer-text">the next you?</em>
          </h2>
        </Reveal>
        <Reveal kind="up" delay={180}>
          <p className="lede lede--light final__lede">
            Start with one portrait. Leave with a direction you can see, compare and hand to your
            stylist with confidence.
          </p>
        </Reveal>
        <Reveal kind="up" delay={260} className="final__actions">
          <Button to="/studio" variant="light" size="lg">
            Launch the Studio <GoArrow />
          </Button>
          <Button href="#process" variant="quiet-light" size="lg">
            How it works
          </Button>
        </Reveal>
        <Reveal kind="up" delay={340} className="final__fine">
          <span>
            <ShieldCheck /> Private by design
          </span>
          <span>
            <Check /> Identity preserved
          </span>
          <span>
            <Check /> No commitment
          </span>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lfoot">
      <div className="shell-w lfoot__inner">
        <div className="lfoot__brand">
          <Wordmark />
          <p>See yourself, reimagined.</p>
        </div>
        <nav className="lfoot__nav" aria-label="Footer">
          <div>
            <h3>Studio</h3>
            <Link to="/studio">Launch Studio</Link>
            <Link to="/studio">Hairstyles</Link>
            <Link to="/studio">Hair colour</Link>
            <Link to="/studio">Beard studio</Link>
          </div>
          <div>
            <h3>Product</h3>
            <a href="#process">How it works</a>
            <a href="#why">Why Musè</a>
            <a href="#results">Results</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h3>Workspace</h3>
            <Link to="/lookbook">Lookbook</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/help">Help centre</Link>
          </div>
        </nav>
      </div>
      <div className="shell-w lfoot__base">
        <span>© {new Date().getFullYear()} Musè Hair Studio</span>
        <span>Portrait analysis runs on your device</span>
      </div>
    </footer>
  );
}

/* ========================================================================== */

export default function Landing() {
  const root = useRevealRoot();

  return (
    <div className="landing" ref={root}>
      <a className="skip-link" href="#process">
        Skip to content
      </a>
      <LandingNav />
      <main>
        <Hero />
        <StylingDirections />
        <HowItWorks />
        <StyleCategories />
        <WhyUs />
        <Showcase />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
