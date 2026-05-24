import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, Mail, Share2, ExternalLink, Printer, ArrowLeft } from "lucide-react";
import AppPageScaffold from "../../components/layout/AppPageScaffold";
import { receiptsApi } from "../../api/receiptsApi";
import api from "../../api/client";
import ReceiptDocument from "../../components/receipts/ReceiptDocument";
import ReceiptBlockchainProof from "../../components/receipts/ReceiptBlockchainProof";
import "../../styles/receipt-portal.css";

export default function ReceiptDetailPage({ basePath = "/tenant/receipts" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["receipt", id],
    queryFn: () => receiptsApi.get(id),
  });

  const downloadPdf = async () => {
    try {
      const res = await api.get(`/receipts/${id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data?.receipt_number || "receipt"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Could not download PDF");
    }
  };

  const share = async () => {
    const url = data?.verification_url || receiptsApi.verifyPageUrl(data?.verification_token);
    try {
      if (navigator.share) await navigator.share({ title: data?.receipt_number, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Verification link copied");
      }
    } catch {
      toast.error("Share cancelled");
    }
  };

  const email = async () => {
    try {
      await receiptsApi.email(id);
      toast.success("Receipt emailed");
    } catch {
      toast.error("Could not send email");
    }
  };

  if (isLoading) {
    return (
      <AppPageScaffold title="Receipt details" subtitle="Loading…">
        <p className="text-white/50">Loading receipt…</p>
      </AppPageScaffold>
    );
  }

  if (!data) {
    return (
      <AppPageScaffold title="Receipt details" subtitle="Not found">
        <p className="text-white/50">Receipt not found.</p>
      </AppPageScaffold>
    );
  }

  return (
    <AppPageScaffold
      title="Receipt details"
      subtitle={data.receipt_number}
      actions={
        <button type="button" className="btn-ghost text-sm" onClick={() => navigate(basePath)}>
          <ArrowLeft size={16} /> Back
        </button>
      }
    >
      <div className="receipt-page !px-0">
        <div className="receipt-actions">
          <button type="button" className="receipt-btn receipt-btn--primary" onClick={downloadPdf}>
            <Download size={14} /> Download PDF
          </button>
          <button type="button" className="receipt-btn receipt-btn--ghost" onClick={share}>
            <Share2 size={14} /> Share
          </button>
          <button type="button" className="receipt-btn receipt-btn--ghost" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
          <button type="button" className="receipt-btn receipt-btn--ghost" onClick={email}>
            <Mail size={14} /> Email
          </button>
          {data.explorer_url && (
            <a href={data.explorer_url} target="_blank" rel="noreferrer" className="receipt-btn receipt-btn--violet">
              <ExternalLink size={14} /> Sui Explorer
            </a>
          )}
        </div>

        <div className="receipt-detail-layout">
          <ReceiptDocument receipt={data} />
          <ReceiptBlockchainProof receipt={data} />
        </div>
      </div>
    </AppPageScaffold>
  );
}
