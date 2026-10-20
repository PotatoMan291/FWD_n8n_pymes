import { apiRequest } from "./api";

export function getInvoices() {
  return apiRequest("/facturas");
}

export function getInvoiceById(id) {
  return apiRequest(`/facturas/${encodeURIComponent(id)}`);
}

export function createInvoice(invoice) {
  return apiRequest("/facturas", {
    method: "POST",
    body: JSON.stringify(invoice),
  });
}

export function updateInvoice(id, invoice) {
  return apiRequest(`/facturas/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(invoice),
  });
}

export function deleteInvoice(id) {
  return apiRequest(`/facturas/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
