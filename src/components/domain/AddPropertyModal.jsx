import AddPropertyForm from "./AddPropertyForm";
import { Modal } from "../ui/index.jsx";

export default function AddPropertyModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Add property" size="lg">
      <AddPropertyForm mode="modal" onCancel={onClose} onSuccess={() => onClose()} />
    </Modal>
  );
}
