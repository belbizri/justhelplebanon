import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Just Help Lebanon';
const BASE_URL = 'https://justhelplebanon.com';
const DEFAULT_IMAGE = 'https://i.imgur.com/gL95eWA.jpeg';

const DEFAULTS = {
  title: 'Help Lebanon — Donate to the Lebanese Red Cross | Just Help Lebanon',
  description:
    'Help Lebanon today. Donate to the Lebanese Red Cross to provide emergency medical kits, shelter, and food for families affected by the Lebanon crisis. Every dollar saves lives.',
  keywords:
    'help lebanon, donate lebanon, lebanon crisis, lebanese red cross, lebanon humanitarian aid, lebanon donation, support lebanon, aid lebanon families',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
};

function ensureHeadElement(selector, tagName, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }
  return element;
}

function setNamedMeta(name, content) {
  const element = ensureHeadElement(`meta[name="${name}"]`, 'meta', { name });
  element.setAttribute('content', content);
}

function setPropertyMeta(property, content) {
  const element = ensureHeadElement(`meta[property="${property}"]`, 'meta', { property });
  element.setAttribute('content', content);
}

function setLink(rel, href) {
  const element = ensureHeadElement(`link[rel="${rel}"]`, 'link', { rel });
  element.setAttribute('href', href);
}

function setStructuredData(payload) {
  let element = document.getElementById('page-seo-jsonld');
  if (!element) {
    element = document.createElement('script');
    element.id = 'page-seo-jsonld';
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(payload);
}

export default function usePageSeo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  keywords = DEFAULTS.keywords,
  robots = DEFAULTS.robots,
  structuredData,
}) {
  const location = useLocation();

  useEffect(() => {
    const resolvedTitle = title || DEFAULTS.title;
    const resolvedDescription = description || DEFAULTS.description;
    const resolvedPath = path || location.pathname || '/';
    const canonicalUrl = new URL(resolvedPath, BASE_URL).toString();

    document.title = resolvedTitle;
    setNamedMeta('description', resolvedDescription);
    setNamedMeta('keywords', keywords);
    setNamedMeta('robots', robots);
    setLink('canonical', canonicalUrl);

    setPropertyMeta('og:type', 'website');
    setPropertyMeta('og:site_name', SITE_NAME);
    setPropertyMeta('og:title', resolvedTitle);
    setPropertyMeta('og:description', resolvedDescription);
    setPropertyMeta('og:image', image);
    setPropertyMeta('og:url', canonicalUrl);

    setNamedMeta('twitter:card', 'summary_large_image');
    setNamedMeta('twitter:title', resolvedTitle);
    setNamedMeta('twitter:description', resolvedDescription);
    setNamedMeta('twitter:image', image);

    if (structuredData) {
      setStructuredData(structuredData);
    }
  }, [description, image, keywords, location.pathname, path, robots, structuredData, title]);
}