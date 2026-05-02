(() => {
  const featuredProduct = {
    message: 'Bake warmth into your home with simple, reliable recipes that deliver every time.',
    cta: 'Get the Cozy Cookbook',
    href: 'https://lebiru.gumroad.com/l/cozy-cafe-bakes'
  };

  const trackEvent = (eventName, link) => {
    if (typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: link.textContent.trim(),
      destination_url: link.href,
      page_location: window.location.href
    });
  };

  const bar = document.createElement('section');
  bar.className = 'featured-product-bar';
  bar.setAttribute('aria-live', 'polite');
  bar.setAttribute('role', 'region');

  const message = document.createElement('p');
  message.className = 'featured-product-bar__message';
  message.textContent = featuredProduct.message;

  const cta = document.createElement('a');
  cta.className = 'featured-product-bar__cta';
  cta.href = featuredProduct.href;
  cta.target = '_blank';
  cta.rel = 'noopener noreferrer';
  cta.textContent = featuredProduct.cta;
  cta.addEventListener('click', () => trackEvent('top_featured_product_cta_click', cta));

  bar.append(message, cta);

  const body = document.body;
  const header = body.querySelector('header');
  if (header) {
    // Place the bar in front of the existing site header for visibility.
    body.insertBefore(bar, header);
  } else {
    body.prepend(bar);
  }

  const landingCta = document.querySelector('.feature-product-landing__cta');
  if (landingCta) {
    landingCta.addEventListener('click', () => trackEvent('featured_product_cta_click', landingCta));
  }
})();
