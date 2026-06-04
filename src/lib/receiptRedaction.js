/** Customer-safe display for receipts and public verification. */

export function maskPersonName(name) {
  if (!name || !String(name).trim()) return null;
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function maskAddress(address) {
  if (!address || !String(address).trim()) return null;
  const text = String(address).trim();
  if (text.includes(",")) {
    const segments = text.split(",").map((s) => s.trim()).filter(Boolean);
    if (segments.length >= 2) return segments.slice(-2).join(", ");
  }
  if (text.length > 48) return `${text.slice(0, 45).trim()}…`;
  return text;
}

export function maskReference(ref) {
  if (!ref || !String(ref).trim()) return null;
  const text = String(ref).trim();
  if (text.length <= 8) return text;
  return `···${text.slice(-8)}`;
}

export function maskWalletOrHash(value) {
  if (!value || !String(value).trim()) return null;
  const text = String(value).trim();
  if (text.length <= 12) return text;
  return `${text.slice(0, 6)}…${text.slice(-4)}`;
}

/** Prepare receipt object for printable / shareable document. */
export function receiptForDocument(receipt) {
  if (!receipt) return receipt;
  return {
    ...receipt,
    tenant_name: maskPersonName(receipt.tenant_name) ?? receipt.tenant_name,
    landlord_name: maskPersonName(receipt.landlord_name) ?? receipt.landlord_name,
    property_address: maskAddress(receipt.property_address) ?? receipt.property_address,
    transaction_reference: maskReference(receipt.transaction_reference) ?? receipt.transaction_reference,
    wallet_address: receipt.wallet_address ? maskWalletOrHash(receipt.wallet_address) : null,
    tx_hash: receipt.tx_hash ? maskWalletOrHash(receipt.tx_hash) : null,
    walrus_blob_id: undefined,
    checksum: undefined,
    digital_signature: undefined,
    verification_hash: undefined,
    smart_summary: undefined,
  };
}

/** Public verify API payload — minimal PII. */
export function verifyPayloadForDisplay(data) {
  if (!data) return data;
  return {
    ...data,
    tenant_name: maskPersonName(data.tenant_name) ?? data.tenant_name,
    landlord_name: maskPersonName(data.landlord_name) ?? data.landlord_name,
    property_address: maskAddress(data.property_address) ?? data.property_address,
    transaction_reference: maskReference(data.transaction_reference) ?? data.transaction_reference,
    wallet_address: data.wallet_address ? maskWalletOrHash(data.wallet_address) : undefined,
    tx_hash: data.tx_hash ? maskWalletOrHash(data.tx_hash) : undefined,
    verification_hash: undefined,
    checksum: undefined,
    digital_signature: undefined,
    smart_summary: undefined,
  };
}
