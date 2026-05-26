import BlockchainVerifyPage from "../verify/BlockchainVerifyPage";

/** Legacy route /verify/receipt/:token — same trust UI as unified /verify/:token */
export default function ReceiptVerifyPage() {
  return <BlockchainVerifyPage forcedKind="receipt" />;
}
