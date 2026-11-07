/*
 * AIR HVAC - Google Analytics 4
 * Only loads the Google tag following an affirmative analytics consent choice.
 * Measurement ID is public by design; it is not an API secret.
 */
(() => {
  'use strict';

  const MEASUREMENT_ID = 'G-TBM7VP71HT';
  const CONSENT_KEY = 'airhvac_analytics_consent_v1';
  let initialized = false;
  let banner = null;

  function getChoice() {
    try { return localStorage.getItem(CONSENT_KEY); }
    catch (_) { return null; }
  }

  function setChoice(value) {
    try { localStorage.setItem(CONSENT_KEY, value); }
    catch (_) { /* Storage may be unavailable in private mode. */ }
  }

  function enableAnalytics() {
    if (initialized) return;
    initialized = true;
    window['ga-disable-' + MEASUREMENT_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID);

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' +
      encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(tag);
  }

  function clearAnalyticsCookies() {
    const domain = location.hostname.replace(/^www\./, '');
    const domainVariants = [null, location.hostname, '.' + domain];
    const cookieNames = document.cookie.split(';').map(function (part) {
      return part.split('=')[0].trim();
    }).filter(function (name) {
      return /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name);
    });

    cookieNames.forEach(function (name) {
      domainVariants.forEach(function (cookieDomain) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' +
          (cookieDomain ? '; domain=' + cookieDomain : '');
      });
    });
  }

  function choose(value) {
    const wasRunning = initialized;
    setChoice(value);
    if (banner) banner.hidden = true;
    if (value === 'accepted') {
      enableAnalytics();
      return;
    }
    if (wasRunning) {
      // Withdraw consent immediately and unload Google's tag by reloading.
      window['ga-disable-' + MEASUREMENT_ID] = true;
      clearAnalyticsCookies();
      location.reload();
    }
  }

  function makeBanner() {
    banner = document.createElement('aside');
    banner.className = 'analytics-consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-labelledby', 'analytics-consent-title');
    banner.innerHTML =
      '<div class="analytics-consent-copy">' +
        '<strong id="analytics-consent-title">Analytics cookies</strong>' +
        '<p>May we use Google Analytics to understand how visitors use our site ' +
        'and which contact options they click? Analytics is off unless you accept. ' +
        '<a href="/privacy.html">Learn more</a>.</p>' +
      '</div>' +
      '<div class="analytics-consent-actions">' +
        '<button type="button" data-consent="rejected">Reject analytics</button>' +
        '<button type="button" data-consent="accepted">Accept analytics</button>' +
      '</div>';
    document.body.appendChild(banner);
    banner.addEventListener('click', function (event) {
      const target = event.target.closest('[data-consent]');
      if (target) choose(target.dataset.consent);
    });

    const footer = document.querySelector('.footer-inner');
    if (footer) {
      const preferences = document.createElement('button');
      preferences.type = 'button';
      preferences.className = 'analytics-preferences';
      preferences.textContent = 'Cookie preferences';
      preferences.addEventListener('click', function () {
        banner.hidden = false;
        banner.querySelector('button')?.focus();
      });
      footer.appendChild(preferences);
    }
  }

  function trackContactClicks() {
    document.addEventListener('click', function (event) {
      if (!initialized || getChoice() !== 'accepted') return;
      const link = event.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      let method = null;
      if (/^tel:/i.test(href)) method = 'phone';
      else if (/^mailto:/i.test(href)) method = 'email';
      else if (/^https?:\/\/(?:wa\.me|api\.whatsapp\.com)\//i.test(href)) method = 'whatsapp';
      if (method && typeof window.gtag === 'function') {
        // Do not send phone numbers, email addresses or message contents.
        window.gtag('event', 'contact_click', { contact_method: method });
      }
    });
  }

  function init() {
    makeBanner();
    trackContactClicks();
    const choice = getChoice();
    if (choice === 'accepted') {
      banner.hidden = true;
      enableAnalytics();
    } else if (choice === 'rejected') {
      banner.hidden = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
