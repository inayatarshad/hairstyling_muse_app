'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';

import { categoriesFor, refinementsFor, stylesFor } from '../../data/catalog';
import StylePreview from '../StylePreview';
import { Bar, Segment } from '../ui';

const GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' }
];

/* -------------------------------------------------------------------------- */
/* Category rail                                                               */
/* -------------------------------------------------------------------------- */

function CategoryRail({ categories, value, onChange }) {
  const railRef = useRef(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measure = () => {
    const el = railRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft > 4,
      end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    });
  };

  useEffect(() => {
    measure();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      ro.disconnect();
    };
  }, [categories]);

  const nudge = (direction) => {
    railRef.current?.scrollBy({ left: direction * 220, behavior: 'smooth' });
  };

  return (
    <div className={`catrail ${edges.start ? 'has-start' : ''} ${edges.end ? 'has-end' : ''}`}>
      <button className="catrail__arrow catrail__arrow--l" onClick={() => nudge(-1)} aria-label="Scroll categories left">
        <ChevronLeft />
      </button>

      <div className="catrail__track scroll-x no-bar" ref={railRef} role="tablist" aria-label="Style categories">
        {categories.map((category) => (
          <button
            key={category.id}
            role="tab"
            aria-selected={value === category.id}
            className={`catrail__tab ${value === category.id ? 'is-active' : ''}`}
            onClick={() => onChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <button className="catrail__arrow catrail__arrow--r" onClick={() => nudge(1)} aria-label="Scroll categories right">
        <ChevronRight />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Refinements                                                                 */
/* -------------------------------------------------------------------------- */

function Refinements({ style, options, onChange }) {
  const controls = refinementsFor(style);
  const [open, setOpen] = useState(false);

  if (!controls.length) return null;

  return (
    <section className={`refine ${open ? 'is-open' : ''}`}>
      <button className="refine__toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <SlidersHorizontal />
        <span>
          <strong>Refine this look</strong>
          <small>{controls.length} controls for {style.name}</small>
        </span>
        <ChevronRight className="refine__chev" />
      </button>

      <div className="refine__body">
        <div>
          {controls.map((control) => (
            <Bar
              key={control.key}
              label={control.label}
              options={control.range ? undefined : control.options}
              poles={control.poles}
              value={options[control.key] ?? control.default}
              onChange={(value) => onChange(control.key, value)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Browser                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The visual style picker. Categories across the top, a three-up grid of
 * preview cards below, refinements underneath. Selecting is a single tap.
 */
export default function StyleBrowser({
  gender,
  onGender,
  category,
  onCategory,
  styleId,
  onStyle,
  options,
  onOption,
  selectedStyle
}) {
  const [query, setQuery] = useState('');

  const categories = useMemo(() => categoriesFor(gender), [gender]);

  /* Keep the active category valid when the gender flips. */
  useEffect(() => {
    if (!categories.some((c) => c.id === category)) {
      onCategory(categories[0]?.id || 'trending');
    }
  }, [categories, category, onCategory]);

  const styles = useMemo(() => {
    const list = stylesFor(category, gender);
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter(
      (style) => style.name.toLowerCase().includes(q) || style.meta.toLowerCase().includes(q)
    );
  }, [category, gender, query]);

  const activeCategory = categories.find((c) => c.id === category);

  return (
    <div className="browser">
      <div className="browser__top">
        <Segment options={GENDERS} value={gender} onChange={onGender} ariaLabel="Model" />
        <label className="browser__search">
          <Search />
          <input
            type="text"
            value={query}
            placeholder="Search styles"
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search styles"
          />
        </label>
      </div>

      <CategoryRail categories={categories} value={category} onChange={onCategory} />

      {activeCategory?.blurb && (
        <p className="browser__blurb">
          {activeCategory.blurb}
          <em>{styles.length}</em>
        </p>
      )}

      <div className="browser__grid scroll-y" key={`${category}-${gender}`}>
        {styles.map((style) => (
          <button
            key={style.id}
            className={`stylecard ${styleId === style.id ? 'is-selected' : ''}`}
            onClick={() => onStyle(style)}
            aria-pressed={styleId === style.id}
            aria-label={`${style.name}${style.meta ? `, ${style.meta}` : ''}`}
            title={style.name}
          >
            <span className="stylecard__art">
              <StylePreview style={style} ratio="1 / 1" detail={false} />
              {style.flags.includes('new') && <em className="badge badge--new">New</em>}
              {!style.flags.includes('new') && style.flags.includes('trending') && (
                <em className="badge badge--hot">Hot</em>
              )}
              <i className="stylecard__tick">
                <Check />
              </i>
            </span>
            <span className="stylecard__name">{style.name}</span>
          </button>
        ))}

        {!styles.length && (
          <p className="browser__empty">
            Nothing matches “{query}”. Try a shorter word, or clear the search.
          </p>
        )}
      </div>

      {selectedStyle && <Refinements style={selectedStyle} options={options} onChange={onOption} />}
    </div>
  );
}
