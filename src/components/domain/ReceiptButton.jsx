import { Button } from '../ui/Button'

export function ReceiptButton({ onClick }) {
  return (
    <Button variant="outlined" type="button" onClick={onClick}>
      Receipt
    </Button>
  )
}

