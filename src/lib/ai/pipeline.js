/**
 * Generation stages and the progress protocol shared by every provider.
 *
 * A provider never talks to the UI directly. It receives a `report` function
 * built by `createReporter` and calls `report.enter(id)` / `report.done(id)`.
 * The reporter turns that into a single well-formed progress object, so the
 * studio's stepper does not need to know which provider is running.
 */

/** @typedef {'pending'|'active'|'done'|'failed'|'skipped'} StageState */

export const STAGES = [
  {
    id: 'upload',
    label: 'Upload complete',
    detail: 'Portrait received and held in this browser',
    weight: 6
  },
  {
    id: 'face',
    label: 'Detecting face',
    detail: 'Locating facial landmarks and the hairline',
    weight: 16
  },
  {
    id: 'identity',
    label: 'Preserving identity',
    detail: 'Locking face shape, skin, expression and age',
    weight: 14
  },
  {
    id: 'style',
    label: 'Applying hairstyle',
    detail: 'Building the silhouette and strand direction',
    weight: 30
  },
  {
    id: 'detail',
    label: 'Enhancing details',
    detail: 'Balancing tone, root shadow and edge blending',
    weight: 20
  },
  {
    id: 'render',
    label: 'Rendering final image',
    detail: 'Compositing at full resolution',
    weight: 14
  }
];

export const STAGE_IDS = STAGES.map((s) => s.id);

const totalWeight = STAGES.reduce((sum, s) => sum + s.weight, 0);

/** Fresh all-pending stage list, for the initial UI state. */
export function initialStages() {
  return STAGES.map((s) => ({ ...s, state: /** @type {StageState} */ ('pending') }));
}

/**
 * Builds the reporter handed to providers.
 *
 * @param {(progress: {stages: object[], percent: number, activeId: string|null, message: string}) => void} onProgress
 * @returns {{enter(id: string, message?: string): void,
 *            done(id: string): void,
 *            skip(id: string, why?: string): void,
 *            fail(id: string, why?: string): void,
 *            nudge(fraction: number): void,
 *            finish(): void}}
 */
export function createReporter(onProgress) {
  let stages = initialStages();
  let activeId = null;
  let message = '';
  /** Extra progress inside the active stage, 0 to 1. */
  let partial = 0;

  const percent = () => {
    let earned = 0;
    stages.forEach((stage) => {
      if (stage.state === 'done' || stage.state === 'skipped') earned += stage.weight;
      else if (stage.state === 'active') earned += stage.weight * partial;
    });
    return Math.min(100, Math.round((earned / totalWeight) * 100));
  };

  const emit = () => {
    onProgress?.({
      stages: stages.map((s) => ({ ...s })),
      percent: percent(),
      activeId,
      message
    });
  };

  const setState = (id, state) => {
    stages = stages.map((s) => (s.id === id ? { ...s, state } : s));
  };

  return {
    enter(id, note = '') {
      activeId = id;
      partial = 0;
      message = note || STAGES.find((s) => s.id === id)?.detail || '';
      setState(id, 'active');
      emit();
    },
    done(id) {
      partial = 1;
      setState(id, 'done');
      if (activeId === id) activeId = null;
      emit();
    },
    skip(id, why = '') {
      setState(id, 'skipped');
      if (why) message = why;
      if (activeId === id) activeId = null;
      emit();
    },
    fail(id, why = '') {
      setState(id, 'failed');
      if (why) message = why;
      emit();
    },
    /** Reports movement inside the current stage, for long-running work. */
    nudge(fraction) {
      partial = Math.min(1, Math.max(0, fraction));
      emit();
    },
    /** Id of the stage in flight, or the first unfinished one. */
    current() {
      return activeId || stages.find((s) => s.state === 'pending')?.id || STAGE_IDS[0];
    },
    finish() {
      stages = stages.map((s) => (s.state === 'pending' || s.state === 'active' ? { ...s, state: 'done' } : s));
      activeId = null;
      partial = 1;
      emit();
    }
  };
}

/** Rejects with an abort error as soon as `signal` fires. */
export function throwIfAborted(signal) {
  if (signal?.aborted) {
    const error = new Error('aborted');
    error.name = 'AbortError';
    throw error;
  }
}

/** Abortable delay, used by the demo provider to pace its stages. */
export function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
