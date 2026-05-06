import { Button } from './Button'

export function EmptyState({ title = 'Nothing here yet', message, ctaLabel, onCta }) {
  return (
    <div className="card text-center">
      <div className="text-lg font-semibold text-brand-dark">{title}</div>
      {message ? <div className="mt-1 text-sm text-brand-mid">{message}</div> : null}
      {ctaLabel && onCta ? (
        <div className="mt-4">
          <Button onClick={onCta}>{ctaLabel}</Button>
        </div>
      ) : null}
    </div>
  )
}

