import { request } from "./Client";

// Every receipt I paid or owe a share on, newest first
export function getReceipts() {
  return request("/api/receipts");
}

export function getReceipt(id) {
  return request(`/api/receipts/${id}`);
}

// shares: [{ userId }] for an equal split, or [{ userId, amount }] for a custom one
export function createReceipt(title, totalAmount, shares, includeMyShare) {
  return request("/api/receipts", {
    method: "POST",
    body: { title, totalAmount, shares, includeMyShare },
  });
}

// Resolves with the updated receipt
export function setSharePaid(receiptId, shareId, isPaid) {
  return request(`/api/receipts/${receiptId}/shares/${shareId}/paid`, {
    method: "PATCH",
    body: { isPaid },
  });
}

// Payer only
export function deleteReceipt(id) {
  return request(`/api/receipts/${id}`, { method: "DELETE" });
}