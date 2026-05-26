import { Button } from "./Button";
import { EmptyPanel } from "./StatePanel";

export function EmptyState({ title = "Nothing here yet", message, ctaLabel, onCta }) {
  return (
    <EmptyPanel
      title={title}
      description={message}
      action={
        ctaLabel && onCta ? <Button onClick={onCta}>{ctaLabel}</Button> : null
      }
    />
  );
}
