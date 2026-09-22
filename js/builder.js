/* =============================================
   Paladar Intenso — Configurador de Bolo
   ============================================= */

const FLAVOR_COLORS = {
  Chocolate: '#3d2314',
  'Red Velvet': '#8b2942',
  Baunilha: '#f5f0e8',
  Limão: '#f5f5dc',
  Coco: '#fafafa',
  Misto: '#e8e0d8'
};

const DECORATION_CLASSES = {
  Minimalista: 'deco-minimalista',
  Floral: 'deco-floral',
  Temático: 'deco-tematico',
  'Elegante com detalhes dourados': 'deco-elegante'
};

const EXTRA_ICONS = {
  'Topper personalizado': '🎀',
  'Flores naturais': '🌸',
  'Frutas frescas': '🍓',
  Macarons: '🧁',
  Velas: '🕯️'
};

const builderState = {
  occasion: null,
  tiers: null,
  flavor: null,
  covering: null,
  size: null,
  decoration: null,
  extras: [],
  name: '',
  message: '',
  date: '',
  notes: ''
};

const CUSTOM_OPTION_FIELDS = {
  flavor: { triggerValue: 'Outro sabor', fieldId: 'custom-flavor-field', inputId: 'custom-flavor' },
  covering: { triggerValue: 'Outra cobertura', fieldId: 'custom-covering-field', inputId: 'custom-covering' }
};

let currentStep = 0;
const TOTAL_STEPS = 7;

function initBuilder() {
  const steps = document.querySelectorAll('.builder__step');
  const dots = document.querySelectorAll('.builder__step-dot');
  const prevBtn = document.getElementById('builder-prev');
  const nextBtn = document.getElementById('builder-next');
  const orderBtn = document.getElementById('builder-order');

  if (!steps.length) return;

  document.querySelectorAll('.builder__options').forEach((group) => {
    const field = group.dataset.field;
    const isMulti = group.classList.contains('builder__options--multi');

    group.querySelectorAll('.builder__option').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (isMulti) {
          btn.classList.toggle('selected');
          const value = btn.dataset.value;
          if (btn.classList.contains('selected')) {
            if (!builderState.extras.includes(value)) builderState.extras.push(value);
          } else {
            builderState.extras = builderState.extras.filter((v) => v !== value);
          }
        } else {
          const wasSelected = btn.classList.contains('selected');
          group.querySelectorAll('.builder__option').forEach((b) => b.classList.remove('selected'));
          if (wasSelected) {
            builderState[field] = null;
          } else {
            btn.classList.add('selected');
            builderState[field] = btn.dataset.value;
          }
        }

        const customCfg = CUSTOM_OPTION_FIELDS[field];
        if (customCfg) {
          const customField = document.getElementById(customCfg.fieldId);
          const customInput = document.getElementById(customCfg.inputId);
          const isCustom = builderState[field] === customCfg.triggerValue;
          customField?.classList.toggle('hidden', !isCustom);
          if (isCustom) {
            if (customInput) customInput.value = '';
            builderState[field] = null;
            customInput?.focus();
          } else if (customInput) {
            customInput.value = '';
          }
        }

        updatePreview();
        updateSummary();
        updateOrderButton();
      });
    });
  });

  Object.entries(CUSTOM_OPTION_FIELDS).forEach(([field, cfg]) => {
    document.getElementById(cfg.inputId)?.addEventListener('input', (e) => {
      const customBtn = document.querySelector(`[data-field="${field}"] [data-value="${cfg.triggerValue}"]`);
      if (customBtn && customBtn.classList.contains('selected')) {
        builderState[field] = e.target.value.trim() || null;
        updatePreview();
        updateSummary();
        updateOrderButton();
      }
    });
  });

  document.getElementById('cake-name')?.addEventListener('input', (e) => {
    builderState.name = e.target.value.trim();
    updateSummary();
    updateOrderButton();
  });

  document.getElementById('cake-message')?.addEventListener('input', (e) => {
    builderState.message = e.target.value.trim();
    updateSummary();
    updateOrderButton();
  });

  document.getElementById('cake-date')?.addEventListener('change', (e) => {
    builderState.date = e.target.value;
    updateSummary();
    updateOrderButton();
  });

  document.getElementById('cake-notes')?.addEventListener('input', (e) => {
    builderState.notes = e.target.value.trim();
    updateSummary();
  });

  prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
  nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) goToStep(currentStep + 1);
  });

  function goToStep(step) {
    if (step < 0 || step >= TOTAL_STEPS) return;

    currentStep = step;
    steps.forEach((s) => s.classList.toggle('active', Number(s.dataset.step) === step));
    dots.forEach((d) => d.classList.toggle('active', Number(d.dataset.step) <= step));

    const counter = document.getElementById('step-counter');
    if (counter) counter.textContent = `Passo ${step + 1} de ${TOTAL_STEPS}`;

    prevBtn.disabled = step === 0;
    nextBtn.classList.toggle('hidden', step === TOTAL_STEPS - 1);
    orderBtn.classList.toggle('hidden', step !== TOTAL_STEPS - 1);

    if (step === TOTAL_STEPS - 1) {
      updateSummary();
      updateOrderButton();
    }
  }

  updatePreview();
}

function validateStep(step) {
  const required = ['occasion', 'tiers', 'flavor', 'covering', 'size', 'decoration'];
  const field = required[step];

  const customCfg = field && CUSTOM_OPTION_FIELDS[field];
  if (customCfg && !builderState[field]) {
    const customBtn = document.querySelector(`[data-field="${field}"] [data-value="${customCfg.triggerValue}"]`);
    if (customBtn && customBtn.classList.contains('selected')) {
      const customInput = document.getElementById(customCfg.inputId);
      customInput?.classList.add('builder__input--error');
      customInput?.focus();
      setTimeout(() => customInput?.classList.remove('builder__input--error'), 1500);
      return false;
    }
  }

  if (field && !builderState[field]) {
    shakeStep(step);
    return false;
  }

  if (step === 6 && !builderState.name) {
    const nameInput = document.getElementById('cake-name');
    nameInput?.classList.add('builder__input--error');
    nameInput?.focus();
    setTimeout(() => nameInput?.classList.remove('builder__input--error'), 1500);
    return false;
  }

  if (step === 6 && !builderState.date) {
    const dateInput = document.getElementById('cake-date');
    dateInput?.classList.add('builder__input--error');
    dateInput?.focus();
    setTimeout(() => dateInput?.classList.remove('builder__input--error'), 1500);
    return false;
  }

  return true;
}

function shakeStep(step) {
  const stepEl = document.querySelector(`.builder__step[data-step="${step}"]`);
  stepEl?.classList.add('shake');
  setTimeout(() => stepEl?.classList.remove('shake'), 500);
}

function updatePreview() {
  const preview = document.getElementById('cake-preview');
  const label = document.getElementById('preview-label');
  const toppers = document.getElementById('cake-toppers');
  if (!preview) return;

  const tiers = builderState.tiers;
  const flavor = builderState.flavor;
  const isNaked = tiers === 'naked';

  preview.classList.toggle('cake--naked', isNaked);

  Object.values(DECORATION_CLASSES).forEach((cls) => preview.classList.remove(cls));
  if (builderState.decoration && DECORATION_CLASSES[builderState.decoration]) {
    preview.classList.add(DECORATION_CLASSES[builderState.decoration]);
  }

  let visibleTiers = 1;
  if (tiers === '2') visibleTiers = 2;
  else if (tiers === '3') visibleTiers = 3;
  else if (tiers === 'naked') visibleTiers = 1;

  preview.querySelectorAll('.cake-tier').forEach((tier) => {
    const n = Number(tier.dataset.tier);
    tier.style.display = n <= visibleTiers ? 'block' : 'none';
    if (flavor && FLAVOR_COLORS[flavor]) {
      tier.style.background = FLAVOR_COLORS[flavor];
    }
  });

  if (toppers) {
    toppers.textContent = '';
    builderState.extras.forEach((extra) => {
      const icon = document.createElement('span');
      icon.textContent = EXTRA_ICONS[extra] || '';
      toppers.appendChild(icon);
    });
  }

  const parts = [];
  if (builderState.occasion) parts.push(builderState.occasion);
  if (builderState.flavor) parts.push(builderState.flavor);
  if (builderState.decoration) parts.push(builderState.decoration);

  label.textContent = parts.length
    ? parts.join(' · ')
    : 'O seu bolo';
}

function updateSummary() {
  const list = document.getElementById('summary-list');
  if (!list) return;

  const items = [];

  if (builderState.name) items.push(['Nome', builderState.name]);
  if (builderState.occasion) items.push(['Ocasião', builderState.occasion]);
  if (builderState.tiers) {
    const tierLabel = builderState.tiers === 'naked' ? 'Naked cake' : `${builderState.tiers} andar(es)`;
    items.push(['Base', tierLabel]);
  }
  if (builderState.flavor) items.push(['Sabor da massa', builderState.flavor]);
  if (builderState.covering) items.push(['Cobertura', builderState.covering]);
  if (builderState.size) items.push(['Tamanho', builderState.size]);
  if (builderState.decoration) items.push(['Decoração', builderState.decoration]);
  if (builderState.extras.length) items.push(['Extras', builderState.extras.join(', ')]);
  if (builderState.message) items.push(['Mensagem', `"${builderState.message}"`]);
  if (builderState.date) {
    const formatted = formatDate(builderState.date);
    items.push(['Data', formatted]);
  }
  if (builderState.notes) items.push(['Notas', builderState.notes]);

  list.innerHTML = items.length
    ? items.map(([label, value]) => `<li><span>${label}</span> ${value}</li>`).join('')
    : '<li class="builder__summary-empty">Complete os passos para ver o resumo.</li>';
}

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function buildCustomCakeMessage() {
  const tierLabel = builderState.tiers === 'naked'
    ? 'Naked cake'
    : (builderState.tiers ? `${builderState.tiers} andar(es)` : '—');

  const parts = [
    `Olá, Paladar Intenso! Chamo-me ${builderState.name || '—'} e gostaria de encomendar um bolo personalizado:`,
    `• *Ocasião:* ${builderState.occasion || '—'}`,
    `• *Base:* ${tierLabel}`,
    `• *Sabor da massa:* ${builderState.flavor || '—'}`,
    `• *Cobertura:* ${builderState.covering || '—'}`,
    `• *Tamanho:* ${builderState.size || '—'}`,
    `• *Decoração:* ${builderState.decoration || '—'}`
  ];

  if (builderState.extras.length) parts.push(`• *Extras:* ${builderState.extras.join(', ')}`);
  if (builderState.message) parts.push(`• *Mensagem no bolo:* "${builderState.message}"`);
  if (builderState.date) parts.push(`• *Data desejada:* ${formatDate(builderState.date)}`);
  if (builderState.notes) parts.push(`• *Notas:* ${builderState.notes}`);

  parts.push('Aguardo o vosso contacto!');
  return parts.join('\n\n');
}

function updateOrderButton() {
  const orderBtn = document.getElementById('builder-order');
  if (!orderBtn) return;

  const isComplete = builderState.occasion && builderState.tiers && builderState.flavor
    && builderState.covering && builderState.size && builderState.decoration
    && builderState.name && builderState.date;

  orderBtn.href = isComplete
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildCustomCakeMessage())}`
    : '#';

  orderBtn.classList.toggle('builder__order-btn--disabled', !isComplete);
  orderBtn.setAttribute('aria-disabled', !isComplete);
}

document.addEventListener('DOMContentLoaded', initBuilder);
