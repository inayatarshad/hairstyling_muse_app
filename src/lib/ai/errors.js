/**
 * Typed errors for the generation pipeline.
 *
 * Every provider throws MuseError so the UI can branch on `code` instead of
 * matching on message strings. `userMessage` is safe to render directly;
 * `message` is for logs and may contain provider detail.
 */

export const ErrorCode = {
  /** No portrait supplied. */
  NO_IMAGE: 'NO_IMAGE',
  /** Portrait failed the pre-flight quality check. */
  BAD_IMAGE: 'BAD_IMAGE',
  /** No face found, or more than one. */
  FACE_NOT_FOUND: 'FACE_NOT_FOUND',
  /** Hair segmentation could not start or produced nothing usable. */
  SEGMENTATION_FAILED: 'SEGMENTATION_FAILED',
  /** Provider exists but has no credentials or endpoint configured. */
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  /** Provider name is not in the registry. */
  UNKNOWN_PROVIDER: 'UNKNOWN_PROVIDER',
  /** Requested capability is not supported by the active provider. */
  UNSUPPORTED: 'UNSUPPORTED',
  /** Provider rejected the request. */
  PROVIDER_ERROR: 'PROVIDER_ERROR',
  /** Rate limited or out of credit. */
  QUOTA: 'QUOTA',
  /** Network failure reaching the provider. */
  NETWORK: 'NETWORK',
  /** Caller aborted via AbortSignal. */
  ABORTED: 'ABORTED',
  /** Provider took too long. */
  TIMEOUT: 'TIMEOUT',
  /** Consent checkbox not ticked. */
  NO_CONSENT: 'NO_CONSENT'
};

const FRIENDLY = {
  [ErrorCode.NO_IMAGE]: 'Add a portrait before generating a look.',
  [ErrorCode.BAD_IMAGE]:
    'That photograph will not produce a good result. Try a clearer front-facing portrait in even light.',
  [ErrorCode.FACE_NOT_FOUND]:
    'No single clear face was found. Use a portrait with one person, facing the camera.',
  [ErrorCode.SEGMENTATION_FAILED]:
    'Hair detection could not run in this browser. Your original photo is unchanged.',
  [ErrorCode.NOT_CONFIGURED]:
    'This engine is not connected yet. Switch to the demo engine in Settings, or add provider credentials.',
  [ErrorCode.UNKNOWN_PROVIDER]: 'That generation engine is not available in this build.',
  [ErrorCode.UNSUPPORTED]:
    'The active engine cannot apply this kind of change yet. Colour is available on device today.',
  [ErrorCode.PROVIDER_ERROR]: 'The generation engine rejected the request. Nothing was charged.',
  [ErrorCode.QUOTA]: 'You are out of credits for now. Nothing was charged for this attempt.',
  [ErrorCode.NETWORK]: 'Could not reach the generation engine. Check your connection and try again.',
  [ErrorCode.ABORTED]: 'Generation cancelled.',
  [ErrorCode.TIMEOUT]: 'Generation took too long and was stopped. Nothing was charged.',
  [ErrorCode.NO_CONSENT]: 'Confirm consent to AI image processing before generating.'
};

export class MuseError extends Error {
  /**
   * @param {string} code     one of ErrorCode
   * @param {string} [detail] technical detail for logs
   * @param {object} [meta]   { retryable, provider, cause }
   */
  constructor(code, detail, meta = {}) {
    super(detail || code);
    this.name = 'MuseError';
    this.code = code;
    this.userMessage = FRIENDLY[code] || 'Something went wrong. Please try again.';
    this.retryable = meta.retryable ?? RETRYABLE.has(code);
    this.provider = meta.provider;
    if (meta.cause) this.cause = meta.cause;
  }
}

const RETRYABLE = new Set([
  ErrorCode.NETWORK,
  ErrorCode.TIMEOUT,
  ErrorCode.PROVIDER_ERROR,
  ErrorCode.SEGMENTATION_FAILED
]);

/** Wraps an unknown thrown value as a MuseError without losing the original. */
export function asMuseError(error, fallbackCode = ErrorCode.PROVIDER_ERROR, provider) {
  if (error instanceof MuseError) return error;
  if (error?.name === 'AbortError') return new MuseError(ErrorCode.ABORTED, 'aborted by caller');
  return new MuseError(fallbackCode, error?.message || String(error), { cause: error, provider });
}
