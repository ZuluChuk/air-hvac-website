(() => {
  'use strict';
  function count(path, title) {
    if (typeof window.goatcounter?.count === 'function') {
      window.goatcounter.count({ path, title, event: true });
    }
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (/^tel:/i.test(href)) count('contact-phone', 'Telephone enquiry click');
    else if (/^mailto:/i.test(href)) count('contact-email', 'Email enquiry click');
    else if (/^https?:\/\/(?:wa\.me|api\.whatsapp\.com)\//i.test(href)) count('contact-whatsapp', 'WhatsApp enquiry click');
    if (link.id === 'calc-email') count('calculator-enquiry', 'Calculator enquiry click');
    if (/^https?:\/\/(?:www\.)?instagram\.com\//i.test(href)) count('instagram-click', 'Instagram link click');
    if (/request (?:a |a free |a home installation )?quote|request a home installation quote/i.test(link.textContent)) count('quote-request', 'Quote request click');
  });
  let calculatorUsed = false;
  function trackCalculator(event) {
    if (calculatorUsed || !event.target.closest?.('#cooling-calculator-form')) return;
    if (typeof window.goatcounter?.count !== 'function') return;
    calculatorUsed = true;
    count('calculator-used', 'Calculator used');
  }
  document.addEventListener('input', trackCalculator);
  document.addEventListener('change', trackCalculator);
})();
