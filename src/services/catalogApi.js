const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.success) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload.data;
};

export const fetchCatalogProducts = async (params = {}, signal) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  const response = await fetch(`/api/catalog/products${query ? `?${query}` : ''}`, { signal });
  return handleResponse(response);
};

export const fetchCatalog = async (signal) => {
  const response = await fetch('/api/catalog', { signal });
  return handleResponse(response);
};

export const fetchCatalogProductBySlug = async (slug, signal) => {
  const response = await fetch(`/api/catalog/products/${encodeURIComponent(slug)}`, { signal });
  return handleResponse(response);
};