'use client';

/**
 * Generic remote provider.
 *
 * Posts the generation request to this app's own server route, which is where a
 * real model gets wired in. Keeping the model behind our own endpoint means API
 * keys stay server-side and the browser contract never changes when the
 * underlying model does.
 *
 * Wire format, request:
 *   POST /api/generate
 *   { image, style: { id, cat, prompt, tone }, options, requestId }
 *
 * Wire format, response, either:
 *   { image, width, height, meta }                          final result
 *   { stage, percent, message }                              progress frame (NDJSON stream)
 *   { error: { code, message } }                             typed failure
 *
 * Progress is read as newline-delimited JSON so a slow model can stream stage
 * updates instead of leaving the UI guessing.
 */

import { ErrorCode, MuseError, asMuseError } from '../errors';
import { STAGE_IDS } from '../pipeline';

const ENDPOINT = '/api/generate';
const TIMEOUT_MS = 120_000;

/** Maps an HTTP status onto a typed error code. */
function codeForStatus(status) {
  if (status === 401 || status === 403) return ErrorCode.NOT_CONFIGURED;
  if (status === 402 || status === 429) return ErrorCode.QUOTA;
  if (status === 501) return ErrorCode.NOT_CONFIGURED;
  if (status === 415 || status === 422) return ErrorCode.BAD_IMAGE;
  return ErrorCode.PROVIDER_ERROR;
}

export function createRemoteProvider({ id = 'remote', label = 'Remote engine', endpoint = ENDPOINT } = {}) {
  return {
    id,
    label,
    requiresKey: true,
    capabilities: { colour: true, geometry: true, beard: true, upscale: true },

    async status() {
      try {
        const response = await fetch(endpoint, { method: 'OPTIONS' });
        if (!response.ok) return { ready: false, note: 'Endpoint reachable but not configured.' };
        const body = await response.json().catch(() => ({}));
        return { ready: Boolean(body.ready), note: body.note || '' };
      } catch {
        return { ready: false, note: 'Endpoint unreachable.' };
      }
    },

    async generate(request, report, signal) {
      const { image, style, options = {} } = request;
      if (!image) throw new MuseError(ErrorCode.NO_IMAGE);

      const controller = new AbortController();
      const onAbort = () => controller.abort();
      signal?.addEventListener('abort', onAbort, { once: true });
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        report.enter('upload');

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            image,
            style: style && {
              id: style.id,
              cat: style.cat,
              gender: style.gender,
              prompt: style.prompt,
              tone: style.tone,
              beard: style.beard
            },
            options,
            requestId: request.requestId
          })
        });

        report.done('upload');

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new MuseError(
            body?.error?.code || codeForStatus(response.status),
            body?.error?.message || `HTTP ${response.status}`,
            { provider: id }
          );
        }

        /* Streamed NDJSON: progress frames, then one final result frame. */
        if (response.body && response.headers.get('content-type')?.includes('x-ndjson')) {
          return await readStream(response.body, report, id);
        }

        const body = await response.json();
        if (body.error) {
          throw new MuseError(body.error.code || ErrorCode.PROVIDER_ERROR, body.error.message, { provider: id });
        }
        report.finish();
        return normalise(body, id);
      } catch (error) {
        if (controller.signal.aborted && !signal?.aborted) {
          throw new MuseError(ErrorCode.TIMEOUT, `no response within ${TIMEOUT_MS}ms`, { provider: id });
        }
        if (error instanceof TypeError) {
          throw new MuseError(ErrorCode.NETWORK, error.message, { provider: id, cause: error });
        }
        throw asMuseError(error, ErrorCode.PROVIDER_ERROR, id);
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
      }
    }
  };
}

async function readStream(body, report, providerId) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      let frame;
      try {
        frame = JSON.parse(line);
      } catch {
        continue; // partial or malformed frame, wait for more bytes
      }

      if (frame.error) {
        throw new MuseError(frame.error.code || ErrorCode.PROVIDER_ERROR, frame.error.message, {
          provider: providerId
        });
      }
      if (frame.image) {
        result = frame;
        continue;
      }
      if (frame.stage && STAGE_IDS.includes(frame.stage)) {
        report.enter(frame.stage, frame.message);
        if (typeof frame.percent === 'number') report.nudge(frame.percent / 100);
        if (frame.complete) report.done(frame.stage);
      }
    }
  }

  if (!result) {
    throw new MuseError(ErrorCode.PROVIDER_ERROR, 'stream ended without a result frame', { provider: providerId });
  }
  report.finish();
  return normalise(result, providerId);
}

function normalise(body, providerId) {
  return {
    image: body.image,
    width: body.width,
    height: body.height,
    provider: providerId,
    simulated: false,
    colourApplied: true,
    geometryApplied: true,
    note: body.meta?.note || '',
    ...body.meta
  };
}

export default createRemoteProvider;
