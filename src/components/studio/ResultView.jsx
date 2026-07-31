'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bookmark, Check, Clock3, Download, Info, Maximize, Minimize, RotateCcw,
  Share2, ZoomIn, ZoomOut
} from 'lucide-react';

import { Button, Compare, GoArrow } from '../ui';

const ZOOM_STEPS = [1, 1.6, 2.4, 3.2];

/**
 * Post-generation view: draggable before/after, zoom, full screen, export.
 *
 * Zoom is a CSS transform on a wrapper rather than a canvas redraw, so it stays
 * smooth and never resamples the render.
 */
export default function ResultView({ original, result, style, options, onSave, onRegenerate, onRestart, saved }) {
  const stageRef = useRef(null);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [shareState, setShareState] = useState('');
  const dragRef = useRef(null);

  const zoom = ZOOM_STEPS[zoomIndex];

  /* Reset the pan whenever we return to 1x, so the image cannot get lost. */
  useEffect(() => {
    if (zoom === 1) setPan({ x: 0, y: 0 });
  }, [zoom]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stageRef.current?.requestFullscreen();
    } catch {
      /* Denied or unsupported: the inline view still works. */
    }
  };

  /* Pointer panning, clamped so a zoomed image cannot be dragged off screen. */
  const handleMove = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag) return;
      const limit = 160 * (zoom - 1);
      setPan({
        x: Math.max(-limit, Math.min(limit, drag.x0 + (event.clientX - drag.x))),
        y: Math.max(-limit, Math.min(limit, drag.y0 + (event.clientY - drag.y)))
      });
    },
    [zoom]
  );

  const startDrag = (event) => {
    if (zoom === 1) return;
    dragRef.current = { x: event.clientX, y: event.clientY, x0: pan.x, y0: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  const filename = `Musè-${style?.id || 'look'}-${Date.now().toString(36)}.jpg`;

  const download = () => {
    const link = document.createElement('a');
    link.href = result.image;
    link.download = filename;
    link.click();
  };

  /**
   * Share via the OS sheet when available. The user picks the destination in
   * their own system dialog, so nothing is sent anywhere on our own initiative.
   */
  const share = async () => {
    try {
      const blob = await (await fetch(result.image)).blob();
      const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${style?.name} by Musè` });
        setShareState('shared');
      } else {
        await navigator.clipboard.write?.([new ClipboardItem({ [blob.type]: blob })]);
        setShareState('copied');
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      setShareState('unavailable');
    }
    setTimeout(() => setShareState(''), 2400);
  };

  const summary = [
    style?.cat === 'colour' ? options.technique : options.length,
    style?.cat === 'beard' ? options.beardDensity : options.volume,
    style?.cat === 'men' ? options.fade : options.texture,
    options.finish
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="result">
      <div className="result__stage" ref={stageRef}>
        <div
          className={`result__zoomer ${zoom > 1 ? 'is-zoomed' : ''}`}
          style={{ '--zoom': zoom, '--px': `${pan.x}px`, '--py': `${pan.y}px` }}
          onPointerDown={startDrag}
          onPointerMove={handleMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* The comparison box carries the render's own aspect ratio, so the
              divider, drag handle and labels line up with the photograph
              instead of floating in letterbox space around it. */}
          <div
            className="result__fit"
            style={{
              aspectRatio: result.width && result.height ? `${result.width} / ${result.height}` : '3 / 4'
            }}
          >
            <Compare
              before={original}
              after={result.image}
              beforeLabel="Original"
              afterLabel="Musè"
              start={50}
              className="result__compare"
            />
          </div>
        </div>

        <div className="result__tools">
          <button onClick={() => setZoomIndex((i) => Math.max(0, i - 1))} disabled={zoomIndex === 0} aria-label="Zoom out">
            <ZoomOut />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            aria-label="Zoom in"
          >
            <ZoomIn />
          </button>
          <i />
          <button onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}>
            {fullscreen ? <Minimize /> : <Maximize />}
          </button>
        </div>
      </div>

      <aside className="result__panel">
        <p className="eyebrow">Look complete</p>
        <h2>{style?.name}</h2>
        {summary && <p className="result__summary">{summary}</p>}

        <div className="result__actions">
          <Button onClick={download} block>
            <Download /> Download HD
          </Button>
          <div className="result__row">
            <Button onClick={share} variant="soft">
              {shareState === 'shared' || shareState === 'copied' ? <Check /> : <Share2 />}
              {shareState === 'copied' ? 'Copied' : shareState === 'shared' ? 'Shared' : 'Share'}
            </Button>
            <Button onClick={onSave} variant="soft">
              {saved ? <Check /> : <Bookmark />}
              {saved ? 'Kept' : 'Keep'}
            </Button>
          </div>
          <Button onClick={onRegenerate} variant="outline" block>
            <RotateCcw /> Regenerate
          </Button>
        </div>

        {shareState === 'unavailable' && (
          <p className="result__hint">Sharing is not available in this browser. Use Download instead.</p>
        )}

        {result.note && (
          <div className="result__note">
            <Info />
            <p>
              <strong>{result.simulated ? 'Demo engine' : result.provider}</strong>
              <span>{result.note}</span>
            </p>
          </div>
        )}

        <div className="result__note">
          <Clock3 />
          <p>
            <strong>Stylist note</strong>
            <span>
              Take this preview to a professional to confirm suitability for your current length,
              upkeep, and any colour processing needed.
            </span>
          </p>
        </div>

        <button className="result__restart" onClick={onRestart}>
          Start a new look <GoArrow />
        </button>
      </aside>
    </div>
  );
}
