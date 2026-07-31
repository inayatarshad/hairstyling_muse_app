/**
 * Generation endpoint. Deliberately unimplemented.
 *
 * This is the one place a real model gets wired in. Keeping inference behind
 * our own route means provider keys never reach the browser and the client
 * contract (src/lib/ai/providers/remote.js) stays stable when the model changes.
 *
 * ---------------------------------------------------------------------------
 * Request
 * ---------------------------------------------------------------------------
 * POST /api/generate
 * {
 *   image:   "data:image/jpeg;base64,...",   // the portrait
 *   style:   { id, cat, gender, prompt, tone, beard },
 *   options: {
 *     tone, intensity, warmth, technique,     // colour
 *     length, volume, texture, parting, finish, fade,
 *     beardLength, beardDensity, cheek, beardShape,
 *     identityLock: true                      // never edit outside the hair region
 *   },
 *   requestId: "muse_xxx"                     // idempotency key
 * }
 *
 * ---------------------------------------------------------------------------
 * Response, either a single JSON object
 * ---------------------------------------------------------------------------
 * { image, width, height, meta: { note, geometryApplied } }
 *
 * ---------------------------------------------------------------------------
 * or an application/x-ndjson stream of frames
 * ---------------------------------------------------------------------------
 * {"stage":"face","percent":40,"message":"Locating landmarks"}
 * {"stage":"face","complete":true}
 * {"stage":"style","percent":10}
 * ...
 * {"image":"data:image/jpeg;base64,...","width":1600,"height":2000,"meta":{}}
 *
 * Valid stage ids are exported from src/lib/ai/pipeline.js: upload, face,
 * identity, style, detail, render. Unknown stages are ignored by the client.
 *
 * ---------------------------------------------------------------------------
 * Errors
 * ---------------------------------------------------------------------------
 * { error: { code, message } } with a matching HTTP status. Use the codes in
 * src/lib/ai/errors.js so the UI can react without string matching:
 *   401/403 -> NOT_CONFIGURED    402/429 -> QUOTA
 *   415/422 -> BAD_IMAGE         501     -> NOT_CONFIGURED
 *
 * ---------------------------------------------------------------------------
 * Implementation checklist
 * ---------------------------------------------------------------------------
 * 1. Read the credential from process.env, never from the request body.
 * 2. Reject payloads over your size limit before decoding the image.
 * 3. Derive a hair-region mask server-side, or accept one from the client, and
 *    composite the model output back through it so identityLock is enforced on
 *    the server rather than trusted from the browser.
 * 4. Rate limit per session. The client already treats 429 as QUOTA.
 * 5. Return the render at the source resolution. The client does not upscale.
 */

/* Left on the default runtime deliberately: a real implementation may need Node
   APIs for image decoding, and the route is dynamic either way. */
export const dynamic = 'force-dynamic';

const NOT_CONFIGURED = {
  error: {
    code: 'NOT_CONFIGURED',
    message:
      'No generation model is wired to this deployment yet. The studio runs on the on-device demo engine until one is.'
  }
};

/** Capability probe used by the client provider's status() check. */
export async function OPTIONS() {
  return Response.json(
    { ready: false, note: 'Endpoint present, no model attached.' },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST() {
  return Response.json(NOT_CONFIGURED, {
    status: 501,
    headers: { 'Cache-Control': 'no-store' }
  });
}

export async function GET() {
  return Response.json(NOT_CONFIGURED, { status: 501 });
}
