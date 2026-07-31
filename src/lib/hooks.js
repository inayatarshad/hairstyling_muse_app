'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

const prefersReducedMotion = () =>
  isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Marks <html> as JS-capable so the reveal styles can hide elements safely.
 * Without JS the content stays visible instead of being stuck at opacity 0.
 */
export function useJsClass() {
  useLayoutEffect(() => {
    document.documentElement.classList.add('js');
  }, []);
}

/**
 * Reveals a subtree on scroll. One observer handles every [data-reveal]
 * descendant, so sections do not each pay for their own observer.
 *
 * Re-runs whenever `deps` change, which matters for lists that mount later.
 */
export function useRevealRoot(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    targets.forEach((el) => {
      // Anything already above the fold reveals immediately, so the first
      // paint is not a blank hero on a short viewport.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        el.classList.add('is-in');
      } else {
        io.observe(el);
      }
    });

    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

/** True once the window has scrolled past `offset`. Used by the sticky nav. */
export function useScrolled(offset = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > offset);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [offset]);

  return scrolled;
}

/**
 * Tracks which of `ids` is currently in view, for nav active states.
 */
export function useActiveSection(ids) {
  const [active, setActive] = useState('');
  const key = ids.join('|');

  useEffect(() => {
    const sections = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [key]);

  return active;
}

/**
 * Writes normalised pointer position onto the element as --mx/--my for the
 * .spotlight treatment. Skipped entirely on touch and reduced-motion.
 */
export function useSpotlight() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, []);

  return ref;
}

/**
 * Parallax translate driven by scroll position. `speed` is the fraction of
 * scroll distance the element lags behind by.
 */
export function useParallax(speed = 0.12) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const fromCentre = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-fromCentre * speed).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed]);

  return ref;
}

/**
 * Writes how far the element has travelled through the viewport onto itself as
 * --progress (0 to 1). Drives the How It Works timeline rail.
 */
export function useScrollProgress() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.setProperty('--progress', '1');
      return;
    }

    let frame = 0;
    const read = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const start = window.innerHeight * 0.85;
      const span = r.height + start - window.innerHeight * 0.35;
      const travelled = span > 0 ? (start - r.top) / span : 1;
      el.style.setProperty('--progress', String(Math.min(1, Math.max(0, travelled))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}

/** Counts up to `target` once the element scrolls into view. */
export function useCountUp(target, duration = 1400) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setValue(target);
      return;
    }

    let frame = 0;
    let start = 0;
    const step = (now) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        frame = requestAnimationFrame(step);
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return [value, ref];
}

/** Locks body scroll while a modal or overlay is open. */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}

/** Calls `onClose` on Escape. */
export function useEscape(onClose, active = true) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, active]);
}

/** localStorage-backed state that degrades to in-memory when storage fails. */
export function usePersistentState(key, initial) {
  const [state, setState] = useState(initial);
  const hydrated = useRef(false);

  // Read after mount so server and client markup agree.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      /* private mode or quota: keep the default */
    }
    hydrated.current = true;
  }, [key]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [key, state]);

  return [state, setState];
}

/** Adds a ripple to a button press. Returns the handler and the ripple nodes. */
export function useRipple() {
  const [ripples, setRipples] = useState([]);

  const spawn = useCallback((event) => {
    if (prefersReducedMotion()) return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const id = Date.now() + Math.random();
    setRipples((prev) => [
      ...prev,
      { id, x: event.clientX - rect.left, y: event.clientY - rect.top, size }
    ]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 640);
  }, []);

  return [ripples, spawn];
}
