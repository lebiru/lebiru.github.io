(() => {
  const featuredProduct = {
    message: 'Build visibility, trust, and impact in your software engineering career',
    cta: 'Get the Presentation',
    href: 'https://lebiru.gumroad.com/l/scaling-your-career-brand'
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
