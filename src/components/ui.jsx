'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { useRipple } from '../lib/hooks';

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * One button for the whole app. Renders a Link when `to` is set, an anchor when
 * `href` is set, otherwise a real <button>. Adds a ripple, a hover sheen and an
 * optional loading state.
 */
export function Button({
  children,
  to,
  href,
  variant = '',
  size = '',
  onClick,
  disabled,
  loading,
  block,
  type = 'button',
  className = '',
  ...rest
}) {
  const [ripples, spawn] = useRipple();

  const classes = [
    'btn',
    variant && variant.split(' ').map((v) => `btn--${v}`).join(' '),
    size && `btn--${size}`,
    block && 'btn--block',
    loading && 'btn--loading',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      <span className="btn__label">{children}</span>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="btn__ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </>
  );

  const press = (event) => {
    spawn(event);
    onClick?.(event);
  };

  if (to && !disabled && !loading) {
    return (
      <Link to={to} className={classes} onClick={press} {...rest}>
        {inner}
      </Link>
    );
  }
  if (href && !disabled && !loading) {
    return (
      <a href={href} className={classes} onClick={press} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button
      type={type}
      className={classes}
      onClick={press}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {inner}
    </button>
  );
}

/** Arrow that slides on hover. Pair with Button. */
export const GoArrow = () => <ArrowRight className="btn__arrow" aria-hidden="true" />;

/* -------------------------------------------------------------------------- */
/* Wordmark                                                                    */
/* -------------------------------------------------------------------------- */

export function Wordmark({ tagline = 'VIRTUAL HAIR STUDIO', to = '/', mono = false, className = '' }) {
  const body = (
    <>
      <img className="wordmark__mark" src="/assets/muse-monogram-cropped.png" alt="" />
      <span className="wordmark__text">
        <b>MUSÈ</b>
        {tagline && <small>{tagline}</small>}
      </span>
    </>
  );
  const classes = `wordmark ${mono ? 'wordmark--mono' : ''} ${className}`;
  return to ? (
    <Link className={classes} to={to} aria-label="Musè home">
      {body}
    </Link>
  ) : (
    <span className={classes}>{body}</span>
  );
}

/* -------------------------------------------------------------------------- */
/* Reveal wrapper                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Marks a subtree for scroll reveal. The observer lives on the page root
 * (useRevealRoot), so this only sets attributes.
 */
export function Reveal({ as: Tag = 'div', kind = 'up', delay = 0, className = '', children, ...rest }) {
  return (
    <Tag
      data-reveal={kind}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/* Before / after comparison                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Draggable before/after slider.
 *
 * The control is a full-bleed transparent range input, which gets pointer
 * dragging, click-to-jump, arrow keys and screen-reader support for free.
 *
 * @param {object} props
 * @param {React.ReactNode|string} props.before  node, or an image src
 * @param {React.ReactNode|string} props.after
 */
export function Compare({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  start = 52,
  className = '',
  children
}) {
  const [reveal, setReveal] = useState(start);
  const [dragging, setDragging] = useState(false);

  const render = (content, alt) =>
    typeof content === 'string' ? <img src={content} alt={alt} draggable="false" /> : content;

  return (
    <div
      className={`compare ${dragging ? 'is-dragging' : ''} ${className}`}
      style={{ '--reveal': `${reveal}%` }}
    >
      <div className="compare__pane compare__pane--before">
        {render(before, beforeLabel || 'Before')}
        {beforeLabel && <span className="compare__tag">{beforeLabel}</span>}
      </div>

      <div className="compare__pane compare__pane--after">
        {render(after, afterLabel || 'After')}
        {afterLabel && <span className="compare__tag">{afterLabel}</span>}
      </div>

      <input
        className="compare__range"
        type="range"
        min="0"
        max="100"
        step="0.5"
        value={reveal}
        aria-label={`Reveal ${afterLabel}. Drag or use arrow keys.`}
        onChange={(e) => setReveal(Number(e.target.value))}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      />

      <div className="compare__line" aria-hidden="true">
        <span className="compare__handle">
          <ArrowLeft />
          <ArrowRight />
        </span>
      </div>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Accordion                                                                   */
/* -------------------------------------------------------------------------- */

export function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  const baseId = useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <div className="acc-list">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={item.q} className={`acc ${isOpen ? 'is-open' : ''}`}>
            <h3>
              <button
                id={buttonId}
                className="acc__q"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <span className="acc__icon" aria-hidden="true" />
              </button>
            </h3>
            <div className="acc__body" id={panelId} role="region" aria-labelledby={buttonId}>
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Segmented control                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Sliding-thumb segmented control. The thumb is measured from the DOM so it
 * works with labels of different widths.
 */
export function Segment({ options, value, onChange, ariaLabel }) {
  const wrapRef = useRef(null);
  const [thumb, setThumb] = useState(null);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const active = wrap.querySelector('.is-active');
    if (!active) return;
    setThumb({ x: active.offsetLeft - 4, w: active.offsetWidth });
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [measure, value, options]);

  return (
    <div className="segment" ref={wrapRef} role="tablist" aria-label={ariaLabel}>
      {thumb && (
        <span
          className="segment__thumb"
          style={{ transform: `translateX(${thumb.x}px)`, width: thumb.w }}
          aria-hidden="true"
        />
      )}
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={value === option.value}
          className={value === option.value ? 'is-active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small bits                                                                  */
/* -------------------------------------------------------------------------- */

export function Rating({ value = 5 }) {
  return (
    <span className="rating" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} fill={i < value ? 'currentColor' : 'none'} aria-hidden="true" />
      ))}
    </span>
  );
}

/** Circular avatar built from initials, so no placeholder photos are needed. */
export function Initials({ name, tone = '#4d0e13', size = 52 }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className="initials"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(140deg, ${tone}, #1c0709)`
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/**
 * Glowing selector bar. Replaces dropdowns for refinement controls.
 *
 * A real range input sits invisibly on top, so pointer dragging, click to jump,
 * arrow keys and screen readers all work without custom event plumbing. The
 * visible track is drawn underneath and deepens toward the far end.
 *
 * Values are shown as their label, never as a number.
 *
 * @param {object}   props
 * @param {string}   props.label
 * @param {string[]} [props.options]  discrete steps; omit for a 0 to 100 range
 * @param {string|number} props.value
 * @param {Function} props.onChange
 * @param {string[]} [props.poles]    end captions, e.g. ['Cool', 'Warm']
 */
export function Bar({ label, options, value, onChange, poles }) {
  const stepped = Array.isArray(options) && options.length > 0;

  const index = stepped ? Math.max(0, options.indexOf(value)) : Number(value) || 0;
  const max = stepped ? options.length - 1 : 100;
  const fill = max === 0 ? 100 : (index / max) * 100;
  const shown = stepped ? options[index] : poles ? '' : '';

  return (
    <label className="bar">
      <span className="bar__head">
        <b>{label}</b>
        {shown && <em>{shown}</em>}
      </span>

      <span className="bar__track" style={{ '--fill': `${fill}%` }}>
        <span className="bar__fill" />
        <span className="bar__thumb" />
        {stepped && (
          <span className="bar__ticks" aria-hidden="true">
            {options.map((option) => (
              <i key={option} />
            ))}
          </span>
        )}
        <input
          type="range"
          min="0"
          max={max}
          step="1"
          value={index}
          aria-label={label}
          aria-valuetext={stepped ? options[index] : `${index}%`}
          onChange={(e) => onChange(stepped ? options[Number(e.target.value)] : Number(e.target.value))}
        />
      </span>

      {poles && (
        <span className="bar__poles">
          <i>{poles[0]}</i>
          <i>{poles[1]}</i>
        </span>
      )}
    </label>
  );
}

export function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`toggle ${on ? 'is-on' : ''}`}
      onClick={() => onChange(!on)}
    >
      <i />
    </button>
  );
}
