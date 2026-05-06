import { Button } from './Button'
import { Modal } from './Modal'

export function ConfirmDialog({ open, title = 'Are you sure?', message, onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title}>
      {message ? <div className="text-sm text-brand-mid">{message}</div> : null}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  )
}

