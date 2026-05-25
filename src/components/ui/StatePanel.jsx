import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "./Button";

/**
 * Dark glass panels for loading / error / empty — use instead of bare `.card` + light text.
 */
export function LoadingPanel({ className = "h-40" }) {
  return (
    <div className={`state-panel state-panel--loading ${className}`} role="status" aria-live="polite">
      <div className="state-panel__shimmer" />
    </div>
  );
}

export function ErrorPanel({
  title = "Could not load data",
  description = "Check your connection and that the API is running, then try again.",
  onRetry,
}) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <AlertCircle className="state-panel__icon state-panel__icon--error" strokeWidth={1.75} />
      <h3 className="state-panel__title">{title}</h3>
      {description ? <p className="state-panel__desc">{description}</p> : null}
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-5" onClick={onRetry}>
          <RefreshCw size={14} />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyPanel({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="state-panel state-panel--empty">
      {Icon ? <Icon className="state-panel__icon" strokeWidth={1.5} /> : null}
      <h3 className="state-panel__title">{title}</h3>
      {description ? <p className="state-panel__desc">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
