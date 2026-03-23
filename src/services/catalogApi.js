import catalogData from '../../db/seed-data/catalogData.js';

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

const getFallbackCatalog = () => catalogData?.catalog || { products: [] };

const filterFallbackProducts = (params = {}) => {
  const { status, categoryId, marketCode, limit, skip } = params;
  let products = Array.isArray(getFallbackCatalog().products)
    ? [...getFallbackCatalog().products]
    : [];

  if (status) {
    products = products.filter((product) => product.status === status);
  }

  if (categoryId) {
    products = products.filter((product) => product.category?.id === categoryId);
  }

  if (marketCode) {
    products = products.filter((product) =>
      product.availability?.regions?.includes(marketCode)
    );
  }

  const offset = Number.isFinite(skip) ? skip : 0;
  const cappedLimit = Number.isFinite(limit) ? limit : products.length;
  return products.slice(offset, offset + cappedLimit);
};

export const fetchCatalogProducts = async (params = {}, signal) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  try {
    const response = await fetch(`/api/catalog/products${query ? `?${query}` : ''}`, { signal });
    return await handleResponse(response);
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error;
    }

    return filterFallbackProducts(params);
  }
};

export const fetchCatalog = async (signal) => {
  try {
    const response = await fetch('/api/catalog', { signal });
    return await handleResponse(response);
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error;
    }

    return getFallbackCatalog();
  }
};

export const fetchCatalogProductBySlug = async (slug, signal) => {
  try {
    const response = await fetch(`/api/catalog/products/${encodeURIComponent(slug)}`, { signal });
    return await handleResponse(response);
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error;
    }

    const fallbackProduct = filterFallbackProducts().find(
      (product) => product.slug === slug
    );

    if (!fallbackProduct) {
      throw error;
    }

    return fallbackProduct;
  }
};