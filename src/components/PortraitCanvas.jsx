'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import { detectHair, loadImage, paintHair } from '../lib/ai/segmentation';

/**
 * The live portrait stage.
 *
 * Loads the photograph, segments the hair region once, then repaints on every
 * tone change. Segmentation is the expensive step so it is cached per photo and
 * never re-run for a slider move.
 *
 * @param {object}   props
 * @param {string}   props.photo        data URL
 * @param {string}   props.tone         target hex
 * @param {number}   props.intensity
 * @param {number}   props.warmth
 * @param {string}   props.technique
 * @param {boolean}  props.showOriginal hold to compare
 * @param {Function} [props.onReady]    (dataUrl, meta) once a paint lands
 * @param {Function} [props.onStatus]   status string changes
 */
export default function PortraitCanvas({
  photo,
  tone,
  intensity = 72,
  warmth = 52,
  technique = 'Solid',
  showOriginal = false,
  onReady,
  onStatus
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const maskRef = useRef(null);
  const emitTimer = useRef(0);

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const report = useCallback(
    (next) => {
      setStatus(next);
      onStatus?.(next);
    },
    [onStatus]
  );

  /* Repaint. Cheap enough to run synchronously on every control change. */
  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    paintHair({
      canvas,
      image,
      mask: showOriginal ? null : maskRef.current,
      tone,
      intensity,
      warmth,
      technique
    });

    if (!onReady || showOriginal) return;
    // Debounced so dragging a slider does not produce a data URL per frame.
    clearTimeout(emitTimer.current);
    emitTimer.current = setTimeout(() => {
      onReady(canvas.toDataURL('image/jpeg', 0.92), {
        width: canvas.width,
        height: canvas.height,
        coverage: maskRef.current?.coverage ?? 0
      });
    }, 220);
  }, [tone, intensity, warmth, technique, showOriginal, onReady]);

  /* Load and segment whenever the photo changes. */
  useEffect(() => {
    let cancelled = false;
    maskRef.current = null;
    imageRef.current = null;
    setError('');

    if (!photo) {
      report('idle');
      return;
    }

    (async () => {
      report('loading');
      try {
        const image = await loadImage(photo);
        if (cancelled) return;
        imageRef.current = image;
        repaint();

        report('detecting');
        const mask = await detectHair(image);
        if (cancelled) return;
        maskRef.current = mask;

        if (mask.coverage < 0.004) {
          setError('No hair region was found in this portrait. Colour cannot be applied to it.');
          report('empty');
          return;
        }
        report('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err.userMessage || 'Hair detection could not run in this browser.');
        report('error');
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(emitTimer.current);
    };
    // repaint is stable enough here; re-running on photo only is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo, report]);

  /* Repaint on control changes, once the mask exists. */
  useEffect(() => {
    if (imageRef.current) repaint();
  }, [repaint]);

  const busy = status === 'loading' || status === 'detecting';

  return (
    <div className="portrait">
      <canvas ref={canvasRef} aria-label="Portrait preview" />

      {busy && (
        <div className="portrait__busy">
          <Loader2 />
          <strong>{status === 'detecting' ? 'Detecting hair' : 'Reading portrait'}</strong>
          <span>Separating hair from face, clothing and background on this device</span>
        </div>
      )}

      <span className={`portrait__pill portrait__pill--${status}`}>
        {status === 'ready' ? (
          <>
            <Check /> Hair mask ready
          </>
        ) : status === 'error' || status === 'empty' ? (
          <>
            <AlertTriangle /> Mask unavailable
          </>
        ) : (
          'On-device analysis'
        )}
      </span>

      {showOriginal && <span className="portrait__holding">Original</span>}
      {error && <p className="portrait__error">{error}</p>}
    </div>
  );
}
