'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, Camera, Check, HelpCircle, ImageIcon, RotateCcw, Settings2,
  ShieldCheck, Sparkles, Upload, UserRound, X
} from 'lucide-react';

import { DEMO_MODELS, STYLE_BY_ID, categoriesFor, refinementsFor, stylesFor } from '../data/catalog';
import { ErrorCode, generateLook, initialStages } from '../lib/ai';
import { useEscape, usePersistentState, useScrollLock } from '../lib/hooks';
import { Button, GoArrow, Toggle, Wordmark } from './ui';
import PortraitCanvas from './PortraitCanvas';
import StyleBrowser from './studio/StyleBrowser';
import GenerationOverlay from './studio/GenerationOverlay';
import ResultView from './studio/ResultView';

const STEPS = [
  { id: 'photo', label: 'Photo' },
  { id: 'style', label: 'Style' },
  { id: 'result', label: 'Result' }
];

const DEFAULT_SESSION = {
  gender: 'female',
  photo: '',
  photoIsDemo: false,
  styleId: 'curtain-bangs',
  category: 'trending',
  options: {},
  consent: false,
  identityLock: true,
  credits: 5
};

/** Fills in every refinement default for a style without clobbering choices. */
function withDefaults(style, options) {
  const next = { ...options };
  refinementsFor(style).forEach((control) => {
    if (next[control.key] === undefined) next[control.key] = control.default;
  });
  if (next.tone === undefined) next.tone = style.tone;
  return next;
}

/* ========================================================================== */
/* Photo guidance                                                              */
/* ========================================================================== */

const DO_LIST = [
  'One person, facing the camera',
  'Whole hairline and forehead visible',
  'Even light with no hard shadows',
  'Head level and roughly centred'
];
const AVOID_LIST = [
  'Side profiles or tilted heads',
  'Hair covering the face or hairline',
  'Sunglasses, hats or hands in frame',
  'Heavy filters or motion blur'
];

function GuidanceModal({ onClose, onChoose }) {
  useScrollLock(true);
  useEscape(onClose);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="guide-title">
      <button className="modal__scrim" onClick={onClose} aria-label="Close" />
      <div className="modal__panel card">
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <X />
        </button>
        <p className="eyebrow">Before you upload</p>
        <h2 id="guide-title">Pick a portrait that will work</h2>
        <p className="modal__lede">
          The clearer the hairline, the more accurate the result. Musè checks the photograph before
          anything runs and tells you if something needs fixing.
        </p>

        <div className="guide">
          <div className="guide__col guide__col--do">
            <h3>
              <Check /> Recommended
            </h3>
            <ul>
              {DO_LIST.map((item) => (
                <li key={item}>
                  <Check /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="guide__col guide__col--avoid">
            <h3>
              <X /> Avoid
            </h3>
            <ul>
              {AVOID_LIST.map((item) => (
                <li key={item}>
                  <X /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="modal__foot">
          <span>
            <ShieldCheck /> Analysis runs on this device
          </span>
          <Button onClick={onChoose}>
            Choose photo <GoArrow />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Upload step                                                                 */
/* ========================================================================== */

function UploadStep({ onPhoto, onDemo, gender }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [guide, setGuide] = useState(false);
  const [problem, setProblem] = useState('');

  const accept = (file) => {
    setProblem('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProblem('That file is not an image. Use a JPG, PNG or WebP.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setProblem('That image is over 20 MB. Export a smaller version and try again.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onPhoto(String(reader.result));
    reader.onerror = () => setProblem('That file could not be read. Try a different photo.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="upload">
      <div
        className={`dropzone ${dragging ? 'is-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
      >
        <span className="dropzone__icon">
          <Upload />
        </span>
        <h2>Upload your portrait</h2>
        <p>Drag a photo here, or choose one from your device. JPG, PNG or WebP up to 20 MB.</p>
        <div className="dropzone__actions">
          <Button onClick={() => inputRef.current?.click()} size="lg">
            <Camera /> Choose photo
          </Button>
          <button className="dropzone__guide" onClick={() => setGuide(true)}>
            <HelpCircle /> What makes a good photo?
          </button>
        </div>
        {problem && <p className="dropzone__problem">{problem}</p>}
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>

      <div className="upload__demo">
        <div className="upload__demo-head">
          <h3>Or explore with a demo model</h3>
          <p>See the whole workflow first. Swap in your own photo whenever you like.</p>
        </div>
        <div className="upload__demo-row">
          {DEMO_MODELS.map((model) => (
            <button
              key={model.id}
              className={`demo-card ${model.gender === gender ? 'is-suggested' : ''}`}
              onClick={() => onDemo(model)}
            >
              <img src={model.src} alt="" />
              <span>
                <UserRound /> {model.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="upload__privacy">
        <ShieldCheck /> Portrait analysis and live colour run in this browser. Nothing is uploaded and
        nothing is used for training.
      </p>

      {guide && (
        <GuidanceModal
          onClose={() => setGuide(false)}
          onChoose={() => {
            setGuide(false);
            inputRef.current?.click();
          }}
        />
      )}
    </div>
  );
}

/* ========================================================================== */
/* Studio                                                                      */
/* ========================================================================== */

export default function Studio() {
  const [session, setSession] = usePersistentState('muse-studio-v3', DEFAULT_SESSION);
  const [saved, setSaved] = usePersistentState('muse-lookbook-v3', { looks: [] });

  const [step, setStep] = useState('photo');
  const [holdOriginal, setHoldOriginal] = useState(false);
  const [progress, setProgress] = useState(null);
  const [genError, setGenError] = useState(null);
  const [result, setResult] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const runRef = useRef(null);

  const style = STYLE_BY_ID[session.styleId] || stylesFor('trending', session.gender)[0];

  /* A photo restored from storage should land on the style step, not upload. */
  useEffect(() => {
    if (session.photo && step === 'photo') setStep('style');
    // Only on first hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.photo]);

  const patch = useCallback((changes) => setSession((prev) => ({ ...prev, ...changes })), [setSession]);

  const setOption = useCallback(
    (key, value) => setSession((prev) => ({ ...prev, options: { ...prev.options, [key]: value } })),
    [setSession]
  );

  const chooseStyle = useCallback(
    (next) => {
      setSession((prev) => ({
        ...prev,
        styleId: next.id,
        options: withDefaults(next, { ...prev.options, tone: next.tone, technique: next.technique })
      }));
    },
    [setSession]
  );

  /**
   * Switching model swaps three things at once: the categories on offer, the
   * selected style, and, when the portrait on the stage is one of ours, the
   * demo model itself. Leaving a female portrait on screen while the panel
   * shows men's fades is the thing that made the toggle feel broken.
   */
  const chooseGender = useCallback(
    (gender) => {
      setSession((prev) => {
        if (prev.gender === gender) return prev;

        const categories = categoriesFor(gender);
        const category = categories.some((c) => c.id === prev.category)
          ? prev.category
          : categories[0]?.id || 'trending';

        const kept = STYLE_BY_ID[prev.styleId];
        const keepsWorking = kept && (kept.gender === 'any' || kept.gender === gender);
        const fallback = stylesFor(category, gender)[0] || stylesFor('trending', gender)[0];
        const style = keepsWorking ? kept : fallback;

        const demo = DEMO_MODELS.find((model) => model.gender === gender);
        const onDemoPortrait = prev.photoIsDemo || DEMO_MODELS.some((m) => m.src === prev.photo);

        return {
          ...prev,
          gender,
          category,
          styleId: style?.id || prev.styleId,
          options: style ? withDefaults(style, { tone: style.tone, technique: style.technique }) : prev.options,
          photo: onDemoPortrait && demo ? demo.src : prev.photo,
          photoIsDemo: onDemoPortrait ? true : prev.photoIsDemo
        };
      });
    },
    [setSession]
  );

  const setPhoto = useCallback(
    (photo, isDemo = false) => {
      patch({ photo, photoIsDemo: isDemo });
      setResult(null);
      setStep('style');
    },
    [patch]
  );

  /* ---- Generation ---- */

  const runGeneration = useCallback(async () => {
    if (!session.photo || !style) return;

    setGenError(null);
    setResult(null);
    setProgress({ stages: initialStages(), percent: 0, activeId: null, message: 'Starting up' });
    setStep('generating');

    const run = generateLook({
      image: session.photo,
      style,
      options: { ...session.options, identityLock: session.identityLock },
      consent: session.consent,
      onProgress: setProgress
    });
    runRef.current = run;

    try {
      const output = await run.promise;
      setResult(output);
      setJustSaved(false);
      // Hold on the completed checklist for a beat. Cutting away the instant
      // the last stage ticks makes the whole sequence feel like it was faked.
      await new Promise((resolve) => setTimeout(resolve, 520));
      setStep('result');
      // Functional update: a stale closure value could double-spend a credit.
      setSession((prev) => ({ ...prev, credits: Math.max(0, prev.credits - 1) }));
    } catch (error) {
      if (error.code === ErrorCode.ABORTED) {
        setStep('style');
        setProgress(null);
        return;
      }
      setGenError(error);
    } finally {
      runRef.current = null;
    }
  }, [session.photo, session.options, session.identityLock, session.consent, style, setSession]);

  const cancel = () => runRef.current?.cancel();

  const keepLook = () => {
    if (!result) return;
    const entry = {
      id: Date.now(),
      styleId: style.id,
      styleName: style.name,
      gender: session.gender,
      image: result.image,
      original: session.photo,
      options: session.options,
      created: new Date().toLocaleDateString()
    };
    setSaved((prev) => ({ looks: [entry, ...prev.looks].slice(0, 24) }));
    setJustSaved(true);
  };

  const restart = () => {
    setResult(null);
    setStep('photo');
    patch({ photo: '', photoIsDemo: false });
  };

  const activeStepIndex = STEPS.findIndex((s) => s.id === (step === 'generating' ? 'style' : step));

  const canGenerate = Boolean(session.photo) && Boolean(style) && session.consent && session.credits > 0;

  const blockedReason = !session.photo
    ? 'Add a portrait first'
    : !session.consent
      ? 'Confirm consent to continue'
      : session.credits === 0
        ? 'No credits left'
        : '';

  const options = useMemo(() => (style ? withDefaults(style, session.options) : session.options), [
    style,
    session.options
  ]);

  return (
    <div className="studio">
      <header className="sbar">
        <div className="sbar__left">
          <Link to="/" className="sbar__back" aria-label="Back to home">
            <ArrowLeft />
          </Link>
          <Wordmark tagline="" to={null} />
        </div>

        <ol className="stepper" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              className={i < activeStepIndex ? 'is-done' : i === activeStepIndex ? 'is-active' : ''}
            >
              <span className="stepper__dot">{i < activeStepIndex ? <Check /> : i + 1}</span>
              <span className="stepper__label">{s.label}</span>
            </li>
          ))}
        </ol>

        <div className="sbar__right">
          <span className="credits" title="Renders remaining in this demo">
            <Sparkles /> {session.credits}
          </span>
          <Link to="/lookbook" className="sbar__icon" aria-label="Lookbook">
            <Bookmark />
          </Link>
          <Link to="/settings" className="sbar__icon" aria-label="Settings">
            <Settings2 />
          </Link>
        </div>
      </header>

      {step === 'photo' && (
        <main className="studio__single">
          <UploadStep
            gender={session.gender}
            onPhoto={(photo) => setPhoto(photo, false)}
            onDemo={(model) => {
              chooseGender(model.gender);
              setPhoto(model.src, true);
            }}
          />
        </main>
      )}

      {(step === 'style' || step === 'generating') && (
        <main className="studio__work">
          <section className="studio__stage">
            {session.photo ? (
              <>
                <PortraitCanvas
                  photo={session.photo}
                  tone={options.tone || style?.tone}
                  intensity={options.intensity}
                  warmth={options.warmth}
                  technique={options.technique}
                  showOriginal={holdOriginal}
                />
                <div className="stage__bar">
                  <button
                    onMouseDown={() => setHoldOriginal(true)}
                    onMouseUp={() => setHoldOriginal(false)}
                    onMouseLeave={() => setHoldOriginal(false)}
                    onTouchStart={() => setHoldOriginal(true)}
                    onTouchEnd={() => setHoldOriginal(false)}
                  >
                    <ImageIcon /> Hold original
                  </button>
                  <span className="stage__style">
                    <Sparkles /> {style?.name}
                  </span>
                  <button onClick={restart}>
                    <RotateCcw /> Replace photo
                  </button>
                </div>
              </>
            ) : (
              <div className="stage__empty">
                <ImageIcon />
                <p>Add a portrait to begin</p>
              </div>
            )}
          </section>

          <aside className={`studio__panel ${panelOpen ? 'is-open' : ''}`}>
            <button className="panel__grab" onClick={() => setPanelOpen((v) => !v)} aria-expanded={panelOpen}>
              <i />
              <span>{panelOpen ? 'Hide styles' : `Choose a style · ${style?.name}`}</span>
            </button>

            <div className="panel__scroll">
              <StyleBrowser
                gender={session.gender}
                onGender={chooseGender}
                category={session.category}
                onCategory={(category) => patch({ category })}
                styleId={session.styleId}
                onStyle={chooseStyle}
                options={options}
                onOption={setOption}
                selectedStyle={style}
              />
            </div>

            <div className="panel__foot">
              <div className="panel__guards">
                <label className="guard">
                  <span>
                    <ShieldCheck />
                    <b>Preserve my identity</b>
                  </span>
                  <Toggle
                    on={session.identityLock}
                    onChange={(v) => patch({ identityLock: v })}
                    label="Preserve my identity"
                  />
                </label>
                <label className="guard guard--consent">
                  <input
                    type="checkbox"
                    checked={session.consent}
                    onChange={(e) => patch({ consent: e.target.checked })}
                  />
                  <span>
                    I own this photo and consent to AI processing. Images stay in this browser.
                  </span>
                </label>
              </div>

              <Button onClick={runGeneration} disabled={!canGenerate} block size="lg">
                <Sparkles /> Generate look · 1 credit
              </Button>
              {blockedReason && <p className="panel__blocked">{blockedReason}</p>}
            </div>
          </aside>
        </main>
      )}

      {step === 'generating' && (
        <GenerationOverlay
          progress={progress}
          error={genError}
          onCancel={cancel}
          onRetry={runGeneration}
          onDismiss={() => {
            setGenError(null);
            setStep('style');
          }}
        />
      )}

      {step === 'result' && result && (
        <main className="studio__result">
          <ResultView
            original={session.photo}
            result={result}
            style={style}
            options={options}
            saved={justSaved}
            onSave={keepLook}
            onRegenerate={runGeneration}
            onRestart={restart}
          />
        </main>
      )}
    </div>
  );
}
