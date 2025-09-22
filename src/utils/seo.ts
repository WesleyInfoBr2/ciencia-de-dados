export interface SEOMetaData {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleTags?: string[];
  author?: string;
}

export const updatePageMetadata = (metadata: SEOMetaData) => {
  // Update title
  document.title = metadata.title;

  // Update or create meta tags
  const updateMetaTag = (name: string, content: string, property?: boolean) => {
    const attribute = property ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  };

  // Update canonical link
  if (metadata.canonical) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', metadata.canonical);
  }

  // Basic meta tags
  updateMetaTag('description', metadata.description);

  // Open Graph meta tags
  updateMetaTag('og:title', metadata.ogTitle || metadata.title, true);
  updateMetaTag('og:description', metadata.ogDescription || metadata.description, true);
  
  if (metadata.ogImage) {
    updateMetaTag('og:image', metadata.ogImage, true);
  }
  
  if (metadata.ogType) {
    updateMetaTag('og:type', metadata.ogType, true);
  }

  // Article meta tags
  if (metadata.articlePublishedTime) {
    updateMetaTag('article:published_time', metadata.articlePublishedTime, true);
  }
  
  if (metadata.articleModifiedTime) {
    updateMetaTag('article:modified_time', metadata.articleModifiedTime, true);
  }

  if (metadata.articleTags && metadata.articleTags.length > 0) {
    // Remove existing article:tag meta tags
    document.querySelectorAll('meta[property="article:tag"]').forEach(tag => tag.remove());
    
    // Add new article:tag meta tags
    metadata.articleTags.forEach(tag => {
      updateMetaTag('article:tag', tag, true);
    });
  }

  // Twitter meta tags
  updateMetaTag('twitter:title', metadata.ogTitle || metadata.title, true);
  updateMetaTag('twitter:description', metadata.ogDescription || metadata.description, true);
  
  if (metadata.ogImage) {
    updateMetaTag('twitter:image', metadata.ogImage, true);
  }
};

export const generateStructuredData = (type: 'Article' | 'WebPage', data: any) => {
  const existingScript = document.querySelector('script[type="application/ld+json"]#dynamic-structured-data');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'dynamic-structured-data';
  
  let structuredData;
  
  if (type === 'Article') {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": data.title,
      "description": data.excerpt || data.description,
      "author": {
        "@type": "Person",
        "name": data.author || "CiênciaDeDados.org"
      },
      "publisher": {
        "@type": "Organization",
        "name": "CiênciaDeDados.org",
        "logo": {
          "@type": "ImageObject",
          "url": "https://cienciadedados.org/logo.png"
        }
      },
      "datePublished": data.publishedAt,
      "dateModified": data.updatedAt || data.publishedAt,
      "image": data.coverImage || "https://cienciadedados.org/og-image.jpg",
      "keywords": data.tags?.join(", "),
      "articleSection": data.category,
      "inLanguage": "pt-BR",
      "url": data.url
    };
  } else {
    structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": data.title,
      "description": data.description,
      "url": data.url,
      "inLanguage": "pt-BR",
      "isPartOf": {
        "@type": "WebSite",
        "name": "CiênciaDeDados.org",
        "url": "https://cienciadedados.org"
      }
    };
  }

  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
};

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};