import { apiRequest } from "./api";

export function getProviders() {
  return apiRequest("/proveedores");
}

export function getProviderById(id) {
  return apiRequest(`/proveedores/${encodeURIComponent(id)}`);
}

export function createProvider(provider) {
  return apiRequest("/proveedores", {
    method: "POST",
    body: JSON.stringify(provider),
  });
}

export function updateProvider(id, provider) {
  return apiRequest(`/proveedores/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(provider),
  });
}

export function deleteProvider(id) {
  return apiRequest(`/proveedores/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
