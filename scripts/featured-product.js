(() => {
  const featuredProduct = {
    message: 'Bake warmth into your home with simple, reliable recipes that deliver every time.',
    cta: 'Get the Cozy Cookbook',
    href: 'https://lebiru.gumroad.com/l/cozy-cafe-bakes'
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

  bar.append(message, cta);

  const body = document.body;
  const header = body.querySelector('header');
  if (header) {
    // Place the bar in front of the existing site header for visibility.
    body.insertBefore(bar, header);
  } else {
    body.prepend(bar);
  }
})();
