'use client';

import { AlertTriangle, Check, Loader2, X } from 'lucide-react';
import { Button } from '../ui';

/**
 * Full-stage generation progress.
 *
 * Reads the stage list straight from the pipeline reporter, so it works
 * unchanged whichever provider is running: the on-device demo engine today, a
 * streaming remote model later.
 */
export default function GenerationOverlay({ progress, error, onCancel, onRetry, onDismiss }) {
  const stages = progress?.stages || [];
  const percent = progress?.percent ?? 0;

  return (
    <div className="genr" role="status" aria-live="polite">
      <div className="genr__panel glass glass--dark">
        {error ? (
          <>
            <span className="genr__fail">
              <AlertTriangle />
            </span>
            <h2>Generation stopped</h2>
            <p className="genr__note">{error.userMessage}</p>
          </>
        ) : (
          <>
            <p className="eyebrow eyebrow--light">Musè render engine</p>
            <h2>Creating your preview</h2>
            <p className="genr__note">{progress?.message || 'Starting up'}</p>
          </>
        )}

        <div className="genr__track" aria-hidden="true">
          <i style={{ width: `${percent}%` }} />
        </div>
        <div className="genr__percent">{percent}%</div>

        <ol className="genr__stages">
          {stages.map((stage) => (
            <li key={stage.id} className={`is-${stage.state}`}>
              <span className="genr__icon">
                {stage.state === 'done' ? (
                  <Check />
                ) : stage.state === 'active' ? (
                  <Loader2 />
                ) : stage.state === 'failed' ? (
                  <X />
                ) : stage.state === 'skipped' ? (
                  '·'
                ) : (
                  <i />
                )}
              </span>
              <span className="genr__text">
                <strong>{stage.label}</strong>
                <small>{stage.detail}</small>
              </span>
            </li>
          ))}
        </ol>

        <div className="genr__actions">
          {error ? (
            <>
              {error.retryable && (
                <Button onClick={onRetry} variant="gilt">
                  Try again
                </Button>
              )}
              <Button onClick={onDismiss} variant="ghost-light">
                Back to styles
              </Button>
            </>
          ) : (
            <Button onClick={onCancel} variant="ghost-light" size="sm">
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
