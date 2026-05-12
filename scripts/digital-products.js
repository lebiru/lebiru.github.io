(() => {
  const productsContainer = document.getElementById('digital-products-list');
  if (!productsContainer) {
    return;
  }

  const fallbackProducts = {
    products: [
      {
        title: 'Kids Coloring: Arabic Letters',
        description: 'Help your child explore the Arabic alphabet through fun tracing and coloring activities designed for ages 3–7. This 28-page printable workbook features beginner-friendly tracing practice, cute illustrations, and clean easy-to-color layouts that make learning feel playful and engaging.',
        ctaText: 'Get the Coloring Book',
        linkText: 'lebiru.gumroad.com/l/kids-coloring-arabic',
        href: 'https://lebiru.gumroad.com/l/kids-coloring-arabic',
        dp: 'images/hero/book-cover-hero-arabic.png',
        payhipHref: 'https://payhip.com/b/Z0zNl',
        themeColors: ['#3B5B2E', '#6A9C50', '#C8E6A0', '#F0FAE8']
      },
      {
        title: 'Cozy Cafe Bakes',
        description: 'Bring the warmth of a cozy café into your kitchen with a beautifully designed collection of easy-to-follow baking recipes created for comfort, simplicity, and delicious results.',
        ctaText: 'Get the Cozy Cookbook',
        linkText: 'lebiru.gumroad.com/l/cozy-cafe-bakes',
        href: 'https://lebiru.gumroad.com/l/cozy-cafe-bakes',
        dp: 'images/hero/book-cover-hero-cozy.png',
        payhipHref: 'https://payhip.com/b/ZVp62',
        themeColors: ['#6B4637', '#A56B4F', '#F2D0A7', '#FFF1DC']
      },
      {
        title: 'Scaling Your Career Brand',
        description: 'A polished 32-slide career guide designed to help you sharpen your professional story, strengthen your visibility, and position your personal brand for long-term growth.',
        ctaText: 'Buy the Career Guide',
        linkText: 'lebiru.gumroad.com/l/scaling-your-career-brand',
        href: 'https://lebiru.gumroad.com/l/scaling-your-career-brand',
        dp: 'images/hero/book-cover-hero-5.png',
        payhipHref: 'https://payhip.com/b/K9i3x',
        themeColors: ['#203A5B', '#4E6E9E', '#8CB7E8', '#DCEEFF']
      }
    ]
  };

  const trackEvent = (product) => {
    if (typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('event', 'digital_product_cta_click', {
      event_category: 'engagement',
      event_label: product.title,
      destination_url: product.href,
      page_location: window.location.href
    });
  };

  const createProductCard = (product, index) => {
    const colors = Array.isArray(product.themeColors) && product.themeColors.length
      ? product.themeColors
      : ['#1F2937', '#374151', '#9CA3AF'];

    const article = document.createElement('article');
    article.className = 'digital-product-card';
    article.style.setProperty('--theme-1', colors[0]);
    article.style.setProperty('--theme-2', colors[1] || colors[0]);
    article.style.setProperty('--theme-3', colors[2] || colors[1] || colors[0]);
    article.style.setProperty('--theme-4', colors[3] || colors[2] || colors[1] || colors[0]);
    article.style.setProperty('--card-image', product.dp ? `url("${product.dp}")` : 'none');
    article.style.transitionDelay = `${index * 120}ms`;

    const content = document.createElement('div');
    content.className = 'digital-product-card__content';

    const meta = document.createElement('div');
    meta.className = 'digital-product-card__meta';

    const title = document.createElement('h2');
    title.className = 'digital-product-card__title';
    title.textContent = product.title;

    const description = document.createElement('p');
    description.className = 'digital-product-card__description';
    description.textContent = product.description;

    const cta = document.createElement('a');
    cta.className = 'digital-product-card__cta';
    cta.href = product.href;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    cta.textContent = product.ctaText;
    cta.addEventListener('click', () => trackEvent(product));

    meta.append(title, description);

    const footer = document.createElement('div');
    footer.className = 'digital-product-card__footer';

    footer.append(cta);

    if (product.payhipHref) {
      const payhip = document.createElement('a');
      payhip.className = 'digital-product-card__cta digital-product-card__cta--payhip';
      payhip.href = product.payhipHref;
      payhip.target = '_blank';
      payhip.rel = 'noopener noreferrer';
      payhip.textContent = 'Buy on Payhip';
      payhip.addEventListener('click', () => trackEvent({ ...product, href: product.payhipHref }));
      footer.append(payhip);
    }
    content.append(meta, footer);
    article.appendChild(content);

    return article;
  };

  const revealCards = (cards) => {
    if (!('IntersectionObserver' in window)) {
      cards.forEach((card) => card.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.2
    });

    cards.forEach((card) => observer.observe(card));
  };

  const showMessage = (message) => {
    const state = document.createElement('p');
    state.className = 'digital-products-state';
    state.textContent = message;
    productsContainer.replaceChildren(state);
  };

  const loadProducts = () => {
    if (window.location.protocol === 'file:') {
      return Promise.resolve(fallbackProducts);
    }

    return fetch('data/digital-products.json', { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load digital products.');
        }

        return response.json();
      })
      .catch(() => fallbackProducts);
  };

  showMessage('Loading digital products...');

  loadProducts()
    .then((data) => {
      if (!Array.isArray(data.products) || data.products.length === 0) {
        showMessage('Digital products will appear here soon.');
        return;
      }

      const cards = data.products.map(createProductCard);
      productsContainer.replaceChildren(...cards);
      revealCards(cards);
    })
    .catch(() => {
      showMessage('Unable to load digital products right now. Please try again later.');
    });
})();
