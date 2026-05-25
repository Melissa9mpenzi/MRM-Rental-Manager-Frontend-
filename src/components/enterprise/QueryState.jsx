import { AlertCircle, RefreshCw, Inbox } from "lucide-react";

/**
 * Standard loading / error / empty wrapper for React Query pages.
 */
export default function QueryState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyIcon: EmptyIcon = Inbox,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  onRetry,
  skeleton,
  children,
}) {
  if (isLoading) {
    return skeleton || (
      <div className="space-y-3">
        <div className="enterprise-skeleton h-24" />
        <div className="enterprise-skeleton h-48" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="enterprise-empty border-red-500/25 bg-red-500/5">
        <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
        <h3 className="font-bold text-white">Could not load data</h3>
        <p className="mt-1 max-w-sm text-sm text-white/55">
          {error?.message || "Check your connection and try again."}
        </p>
        {onRetry && (
          <button type="button" className="enterprise-retry" onClick={onRetry}>
            <RefreshCw size={14} className="mr-1 inline" />
            Retry
          </button>
        )}
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="enterprise-empty">
        <EmptyIcon className="mb-3 h-10 w-10 text-white/25" />
        <h3 className="font-bold text-white">{emptyTitle}</h3>
        {emptyDescription && <p className="mt-1 max-w-sm text-sm text-white/50">{emptyDescription}</p>}
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }
  return children;
}
