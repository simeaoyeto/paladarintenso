/* =============================================
   Paladar Intenso — JavaScript Principal
   ============================================= */

const WHATSAPP_NUMBER = '244946368996';

const CAKES = [
  {
    name: 'Bolo de Casamento',
    description: 'Andares, flores e um toque dourado — pensado para o dia mais importante do casal.',
    image: 'assets/images/bolo-casamento.jpg'
  },
  {
    name: 'Bolo de Aniversário',
    description: 'Morangos frescos e folha de ouro. Aquele efeito de abrir a caixa e ficar sem fala.',
    image: 'assets/images/bolo-aniversario.jpg'
  },
  {
    name: 'Bolo de Chocolate',
    description: 'Chocolate a sério, sem meias-medidas, para quem não dispensa um bom pedaço.',
    image: 'assets/images/bolo-chocolate.jpg'
  },
  {
    name: 'Bolo Infantil',
    description: 'Cores vivas e um toque de fantasia. O preferido nas festas de criança.',
    image: 'assets/images/bolo-unicornio.jpg'
  },
  {
    name: 'Bolo Elegante',
    description: 'Textura trabalhada à mão, flor natural e velas douradas. Simples e bonito.',
    image: 'assets/images/bolo-isaura.jpg'
  },
  {
    name: 'Bolo Temático',
    description: 'Feito à medida do tema da festa, do desenho preferido aos personagens favoritos.',
    image: 'assets/images/bolo-tematico.jpg'
  }
];

const GALLERY = [
  { name: 'Bolo Unicórnio', image: 'assets/images/bolo-unicornio.jpg' },
  { name: 'Bolo Temático Piloto', image: 'assets/images/bolo-tematico-piloto.jpg' },
  { name: 'Bolo Infantil Arco-Íris', image: 'assets/images/bolo-infantil-arcoiris.jpg' },
  { name: 'Bolo de Chocolate com Trufas', image: 'assets/images/bolo-chocolate-trufas.jpg' },
  { name: 'Bolo de Chocolate com Morango', image: 'assets/images/bolo-chocolate-morango.jpg' },
  { name: 'Bolo de Chocolate com Oreo', image: 'assets/images/bolo-chocolate-oreo.jpg' },
  { name: 'Bolo de Chocolate com Ginguba', image: 'assets/images/bolo-chocolate-ginguba.jpg' },
  { name: 'Bolo Branco com Morango e Ouro', image: 'assets/images/bolo-branco-morango-dourado.jpg' },
  { name: 'Bolo Temático Arco-Íris', image: 'assets/images/bolo-tematico-arcoiris.jpg' },
  { name: 'Bolo Comemorativo', image: 'assets/images/bolo-comemorativo.jpg' },
  { name: 'Bolo Happy Birthday com Laços', image: 'assets/images/bolo-happy-birthday-lacos.jpg' },
  { name: 'Bolo 16 Anos', image: 'assets/images/bolo-16-anos.jpg' },
  { name: 'Bolo Coração com Rosas', image: 'assets/images/bolo-coracao-rosas.jpg' },
  { name: 'Bolo Isaura', image: 'assets/images/bolo-isaura.jpg' },
  { name: 'Bolo Princesa', image: 'assets/images/bolo-princesa.jpg' }
];

function buildWhatsAppLink(cakeName, note) {
  const lines = [
    cakeName
      ? `Olá, Paladar Intenso! Gostaria de fazer uma encomenda de um ${cakeName}.`
      : 'Olá, Paladar Intenso! Gostaria de fazer uma encomenda.'
  ];
  if (note) lines.push(`*Informação adicional:* ${note}`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n\n'))}`;
}

/* ---- Carrossel ---- */

class Carousel {
  constructor(track, options = {}) {
    this.track = track;
    this.slides = [];
    this.currentIndex = 0;
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.onChange = options.onChange || (() => {});

    this.viewport = track.parentElement;
    this.initSlides();
    this.bindEvents();
    this.goTo(0, false);
  }

  initSlides() {
    this.track.innerHTML = '';
    CAKES.forEach((cake, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel__slide';
      slide.dataset.index = i;

      const inner = document.createElement('div');
      inner.className = 'carousel__slide-inner';

      const img = document.createElement('img');
      img.alt = cake.name;
      img.loading = i < 3 ? 'eager' : 'lazy';
      img.src = cake.image;

      inner.appendChild(img);
      slide.appendChild(inner);
      this.track.appendChild(slide);
      this.slides.push(slide);
    });
  }

  bindEvents() {
    this.viewport.addEventListener('mousedown', (e) => this.dragStart(e));
    this.viewport.addEventListener('mousemove', (e) => this.dragMove(e));
    this.viewport.addEventListener('mouseup', () => this.dragEnd());
    this.viewport.addEventListener('mouseleave', () => this.dragEnd());

    this.viewport.addEventListener('touchstart', (e) => this.dragStart(e), { passive: true });
    this.viewport.addEventListener('touchmove', (e) => this.dragMove(e), { passive: true });
    this.viewport.addEventListener('touchend', () => this.dragEnd());

    window.addEventListener('resize', () => this.goTo(this.currentIndex, false));
  }

  dragStart(e) {
    this.isDragging = true;
    this.startX = this.getClientX(e);
    this.track.style.transition = 'none';
  }

  dragMove(e) {
    if (!this.isDragging) return;
    this.currentX = this.getClientX(e);
    const diff = this.currentX - this.startX;
    const offset = this.getOffset(this.currentIndex);
    this.track.style.transform = `translateX(${offset + diff}px)`;
  }

  dragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.style.transition = '';

    const diff = this.currentX - this.startX;
    const threshold = 50;

    if (diff < -threshold) {
      this.next();
    } else if (diff > threshold) {
      this.prev();
    } else {
      this.goTo(this.currentIndex);
    }
  }

  getClientX(e) {
    return e.type.includes('touch') ? e.touches[0]?.clientX || e.changedTouches[0].clientX : e.clientX;
  }

  getSlideWidth() {
    return this.slides[0]?.offsetWidth || 0;
  }

  getOffset(index) {
    const slideWidth = this.getSlideWidth();
    const viewportWidth = this.viewport.offsetWidth;
    const center = (viewportWidth - slideWidth) / 2;
    return center - index * slideWidth;
  }

  goTo(index, animate = true) {
    const total = this.slides.length;
    this.currentIndex = ((index % total) + total) % total;

    this.slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === this.currentIndex);
    });

    if (!animate) {
      this.track.style.transition = 'none';
    }

    const offset = this.getOffset(this.currentIndex);
    this.track.style.transform = `translateX(${offset}px)`;

    if (!animate) {
      requestAnimationFrame(() => {
        this.track.style.transition = '';
      });
    }

    this.onChange(this.currentIndex);
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }
}

/* ---- Galeria ---- */

function buildGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  GALLERY.forEach((cake) => {
    const item = document.createElement('div');
    item.className = 'gallery__item';

    const img = document.createElement('img');
    img.alt = cake.name;
    img.loading = 'lazy';
    img.src = cake.image;

    const overlay = document.createElement('div');
    overlay.className = 'gallery__item-overlay';

    const name = document.createElement('span');
    name.className = 'gallery__item-name';
    name.textContent = cake.name;

    overlay.appendChild(name);
    item.appendChild(img);
    item.appendChild(overlay);

    item.addEventListener('click', () => {
      openGalleryModal(cake);
    });

    grid.appendChild(item);
  });
}

/* ---- Modal de encomenda (galeria) ---- */

let galleryModalCake = null;

function openGalleryModal(cake) {
  const modal = document.getElementById('gallery-modal');
  const image = document.getElementById('gallery-modal-image');
  const title = document.getElementById('gallery-modal-title');
  const note = document.getElementById('gallery-modal-note');
  if (!modal) return;

  galleryModalCake = cake;
  image.src = cake.image;
  image.alt = cake.name;
  title.textContent = cake.name;
  note.value = '';
  updateGalleryModalOrderLink();

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
}

function updateGalleryModalOrderLink() {
  const orderLink = document.getElementById('gallery-modal-order');
  const note = document.getElementById('gallery-modal-note');
  if (!orderLink || !galleryModalCake) return;
  orderLink.href = buildWhatsAppLink(galleryModalCake.name, note.value.trim());
}

function initGalleryModal() {
  const modal = document.getElementById('gallery-modal');
  const closeBtn = document.getElementById('gallery-modal-close');
  const note = document.getElementById('gallery-modal-note');
  if (!modal) return;

  closeBtn?.addEventListener('click', () => modal.close());
  note?.addEventListener('input', updateGalleryModalOrderLink);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

/* ---- Outras Encomendas ---- */

function formatOtherOrderDate(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function initOtherOrders() {
  const nameEl = document.getElementById('other-name');
  const itemEl = document.getElementById('other-item');
  const quantityEl = document.getElementById('other-quantity');
  const dateEl = document.getElementById('other-date');
  const notesEl = document.getElementById('other-notes');
  const submitBtn = document.getElementById('other-order-whatsapp');
  if (!submitBtn) return;

  function buildMessage() {
    const parts = [
      `Olá, Paladar Intenso! Chamo-me ${nameEl.value.trim() || '—'} e gostaria de fazer uma encomenda:`,
      `• *O que pretende:* ${itemEl.value.trim() || '—'}`,
      `• *Quantidade:* ${quantityEl.value.trim() || '—'}`,
      `• *Data desejada:* ${dateEl.value ? formatOtherOrderDate(dateEl.value) : '—'}`
    ];
    if (notesEl.value.trim()) parts.push(`• *Informação adicional:* ${notesEl.value.trim()}`);
    parts.push('Aguardo o vosso contacto!');
    return parts.join('\n\n');
  }

  function update() {
    const isComplete = nameEl.value.trim() && itemEl.value.trim() && quantityEl.value.trim() && dateEl.value;
    submitBtn.href = isComplete
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`
      : '#';
    submitBtn.classList.toggle('builder__order-btn--disabled', !isComplete);
    submitBtn.setAttribute('aria-disabled', String(!isComplete));
  }

  [nameEl, itemEl, quantityEl, dateEl, notesEl].forEach((el) => {
    el?.addEventListener('input', update);
    el?.addEventListener('change', update);
  });

  update();
}

/* ---- Alternador de modo (bolo / outro produto) ---- */

function initBuilderModeToggle() {
  const toggle = document.getElementById('builder-mode-toggle');
  const cakePanel = document.getElementById('cake-mode-panel');
  const otherPanel = document.getElementById('other-mode-panel');
  if (!toggle) return;

  toggle.querySelectorAll('.builder__mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      toggle.querySelectorAll('.builder__mode-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const isCake = btn.dataset.mode === 'cake';
      cakePanel.classList.toggle('hidden', !isCake);
      otherPanel.classList.toggle('hidden', isCake);
    });
  });
}

/* ---- Inicialização ---- */

document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('carousel-title');
  const descEl = document.getElementById('carousel-desc');
  const orderEl = document.getElementById('carousel-order');
  const dotsEl = document.getElementById('carousel-dots');

  let carousel;

  if (dotsEl) {
    CAKES.forEach((cake, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Ver ${cake.name}`);
      dot.addEventListener('click', () => carousel.goTo(i));
      dotsEl.appendChild(dot);
    });
  }

  function updateCarouselInfo(index) {
    const cake = CAKES[index];
    titleEl.textContent = cake.name;
    descEl.textContent = cake.description;
    orderEl.href = buildWhatsAppLink(cake.name);

    if (dotsEl) {
      dotsEl.querySelectorAll('.carousel__dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  }

  carousel = new Carousel(document.getElementById('carousel-track'), {
    onChange: updateCarouselInfo
  });

  document.getElementById('carousel-prev').addEventListener('click', () => carousel.prev());
  document.getElementById('carousel-next').addEventListener('click', () => carousel.next());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') carousel.prev();
    if (e.key === 'ArrowRight') carousel.next();
  });

  const whatsappLinks = [
    document.getElementById('header-whatsapp'),
    document.getElementById('order-whatsapp')
  ];

  whatsappLinks.forEach((link) => {
    if (link) link.href = buildWhatsAppLink();
  });

  buildGallery();
  initGalleryModal();
  initOtherOrders();
  initBuilderModeToggle();

  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('header--scrolled', window.scrollY > 50);
  });

  const menuBtn = document.getElementById('menu-btn');
  const nav = document.getElementById('nav');

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      nav.classList.remove('open');
    });
  });
});
