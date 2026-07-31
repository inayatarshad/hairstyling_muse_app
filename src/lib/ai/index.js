'use client';

/**
 * The single entry point the UI uses to generate a look.
 *
 * Nothing in src/components imports a provider directly. Swapping models means
 * registering a different provider here, not editing the studio.
 *
 * @example
 *   const run = generateLook({
 *     image: session.photo,
 *     style: STYLE_BY_ID['curtain-bangs'],
 *     options: { intensity: 74, technique: 'Balayage' },
 *     provider: settings.provider,
 *     onProgress: setProgress
 *   });
 *   const result = await run.promise;   // run.cancel() aborts
 */

import { ErrorCode, MuseError, asMuseError } from './errors';
import { createReporter } from './pipeline';
import demoProvider from './providers/demo';
import { createRemoteProvider } from './providers/remote';
import { openaiProvider, replicateProvider, selfHostedProvider } from './providers/stubs';

/**
 * @typedef {object} GenerateRequest
 * @property {string} image              data URL or path to the portrait
 * @property {object} style              entry from data/catalog.js
 * @property {object} [options]          tone, intensity, warmth, technique, refinements
 * @property {string} [requestId]        idempotency key
 * @property {boolean} [consent]         must be true to proceed
 */

/**
 * @typedef {object} GenerateResult
 * @property {string} image              data URL of the render
 * @property {number} width
 * @property {number} height
 * @property {string} provider
 * @property {boolean} simulated         true when no real model produced it
 * @property {boolean} colourApplied
 * @property {boolean} geometryApplied
 * @property {string} note               plain-language caveat for the UI
 */

const PROVIDERS = new Map();

export function registerProvider(provider) {
  PROVIDERS.set(provider.id, provider);
  return provider;
}

registerProvider(demoProvider);
registerProvider(createRemoteProvider({ id: 'remote', label: 'Custom endpoint' }));
registerProvider(openaiProvider);
registerProvider(replicateProvider);
registerProvider(selfHostedProvider);

export const DEFAULT_PROVIDER = 'demo';

export function getProvider(id = DEFAULT_PROVIDER) {
  const provider = PROVIDERS.get(id);
  if (!provider) throw new MuseError(ErrorCode.UNKNOWN_PROVIDER, `no provider registered as "${id}"`);
  return provider;
}

/** Provider list for the settings UI. */
export function listProviders() {
  return [...PROVIDERS.values()].map(({ id, label, requiresKey, capabilities }) => ({
    id,
    label,
    requiresKey,
    capabilities
  }));
}

/**
 * Kicks off a generation.
 *
 * Returns synchronously so the caller can hold onto `cancel` before awaiting.
 *
 * @param {GenerateRequest & {provider?: string, onProgress?: Function}} request
 * @returns {{promise: Promise<GenerateResult>, cancel: () => void, requestId: string}}
 */
export function generateLook({ provider: providerId = DEFAULT_PROVIDER, onProgress, ...request }) {
  const controller = new AbortController();
  const requestId = request.requestId || `muse_${Date.now().toString(36)}`;
  const report = createReporter(onProgress);

  const promise = (async () => {
    if (!request.image) throw new MuseError(ErrorCode.NO_IMAGE);
    if (request.consent === false) throw new MuseError(ErrorCode.NO_CONSENT);

    const provider = getProvider(providerId);

    // Fail before charging a credit if the provider cannot do what was asked.
    const needsGeometry = request.style && request.style.cat !== 'colour';
    if (needsGeometry && !provider.capabilities.geometry && provider.id !== 'demo') {
      throw new MuseError(ErrorCode.UNSUPPORTED, `${provider.id} cannot synthesise cut geometry`, {
        provider: provider.id
      });
    }

    try {
      return await provider.generate({ ...request, requestId }, report, controller.signal);
    } catch (error) {
      const wrapped = asMuseError(error, ErrorCode.PROVIDER_ERROR, provider.id);
      report.fail(report.current(), wrapped.userMessage);
      throw wrapped;
    }
  })();

  return { promise, cancel: () => controller.abort(), requestId };
}

export { ErrorCode, MuseError } from './errors';
export { STAGES, initialStages } from './pipeline';
