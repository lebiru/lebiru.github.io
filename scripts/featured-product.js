(() => {
  const featuredProduct = {
    message: 'Trace, Color & Learn All 46 Basic Japanese Hiragana!',
    cta: 'Get the Coloring Book',
    href: 'https://lebiru.gumroad.com/l/kids-coloring-jhl',
    external: true,
    newTab: true
  };

  const currentScript = document.currentScript;
  const basePath = ((currentScript && currentScript.getAttribute('src')) || '')
    .replace(/scripts\/featured-product\.js(?:\?.*)?$/, '');

  const navLinks = [
    { href: 'index.html', label: 'About Me' },
    { href: 'projects.html', label: 'Projects' },
    { href: 'digital-products.html', label: 'Digital Products' },
    { href: 'gpts.html', label: 'CustomGPTs' },
    { href: 'blog.html', label: 'Blog' },
    { href: 'apps.html', label: 'Apps' },
    { href: 'games.html', label: 'Games' }
  ];

  const footerLinks = [
    ...navLinks,
    { href: 'https://www.linkedin.com/in/bilalakabi/', label: 'LinkedIn', external: true },
    { href: 'https://github.com/lebiru', label: 'GitHub', external: true },
    { href: 'https://lebiru.gumroad.com/subscribe', label: 'Subscribe', external: true }
  ];

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const resolveHref = (href, external = false) => {
    if (external) {
      return href;
    }

    return `${basePath}${href}`;
  };

  const syncHeaderNavigation = () => {
    document.querySelectorAll('header').forEach((header) => {
      header.replaceChildren();

      navLinks.forEach((link, index) => {
        const anchor = document.createElement('a');
        anchor.href = resolveHref(link.href);
        anchor.textContent = link.label;

        if (currentPage === link.href) {
          anchor.setAttribute('aria-current', 'page');
        }

        header.appendChild(anchor);

        if (index < navLinks.length - 1) {
          header.append(' / ');
        }
      });
    });
  };

  const syncFooterNavigation = () => {
    document.querySelectorAll('.footer-links').forEach((footerList) => {
      footerList.replaceChildren();

      footerLinks.forEach((link) => {
        const item = document.createElement('li');
        const anchor = document.createElement('a');

        anchor.href = resolveHref(link.href, link.external);
        anchor.textContent = link.label;

        if (link.external) {
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
        }

        item.appendChild(anchor);
        footerList.appendChild(item);
      });
    });
  };

  const trackEvent = (eventName, link, eventParameters = {}) => {
    if (typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: link.textContent.trim(),
      destination_url: link.href,
      page_location: window.location.href,
      ...eventParameters
    });
  };

  syncHeaderNavigation();
  syncFooterNavigation();

  const bar = document.createElement('section');
  bar.className = 'featured-product-bar';
  bar.setAttribute('aria-live', 'polite');
  bar.setAttribute('role', 'region');

  const message = document.createElement('a');
  message.className = 'featured-product-bar__message';
  message.href = resolveHref(featuredProduct.href, featuredProduct.external);
  if (featuredProduct.newTab) {
    message.target = '_blank';
    message.rel = 'noopener noreferrer';
  }
  message.textContent = featuredProduct.message;
  message.addEventListener('click', () => trackEvent('top_featured_product_message_click', message));

  const cta = document.createElement('a');
  cta.className = 'featured-product-bar__cta';
  cta.href = resolveHref(featuredProduct.href, featuredProduct.external);
  if (featuredProduct.newTab) {
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
  }
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

  document.querySelectorAll('.bt-cta').forEach((playCta) => {
    playCta.addEventListener('click', () => trackEvent('bastion_tactics_play_cta_click', playCta, {
      cta_location: playCta.dataset.ctaLocation || 'unknown'
    }));
  });
})();
