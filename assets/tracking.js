/*  HARCANDO · GA4 event tracking
 *  Eventos custom enviados a GA4 (Measurement ID G-HSE6KV3ZYB).
 *  Carga global: se infiere el "source" desde el contexto del DOM (sin tocar markup).
 *
 *  Eventos:
 *   - whatsapp_click       · clic a cualquier wa.me/<numero>
 *   - email_click          · clic a cualquier mailto:
 *   - instagram_click      · clic a instagram.com/...
 *   - nota_click           · clic en una .cluster-card desde el pillar /notas/
 *   - form_submit_success  · enviado desde index.html en el handler del form
 *   - contacto_view        · scroll alcanza la sección #contacto (señal de intención)
 */

(function () {
  'use strict';

  // Helper: dispara gtag si está disponible, no rompe si no
  function track(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }
  // Exponer global para que el form del index lo use
  window.harcandoTrack = track;

  // Inferir source desde el contenedor padre del link
  function inferSource(link) {
    if (link.closest('.hero')) return 'hero';
    if (link.closest('nav')) return 'nav';
    if (link.closest('.contacto-card')) return 'contacto';
    if (link.closest('.cta')) return 'cta-articulo';
    if (link.closest('.cluster-card')) return 'cluster-card';
    if (link.closest('footer')) return 'footer';
    if (link.closest('.prose-body')) return 'prose-body';
    return 'otro';
  }

  // Delegated click listener — corre en cada página
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link || !link.href) return;

    var href = link.href;
    var source = inferSource(link);
    var page = location.pathname;

    if (href.indexOf('wa.me/') !== -1) {
      track('whatsapp_click', { source: source, page: page });
    } else if (href.indexOf('mailto:') === 0) {
      track('email_click', { source: source, page: page });
    } else if (href.indexOf('instagram.com/') !== -1) {
      track('instagram_click', { source: source, page: page });
    } else if (link.closest('.cluster-card')) {
      var title = link.querySelector('.cluster-title');
      track('nota_click', {
        nota_title: title ? title.innerText.trim() : 'sin-titulo',
        page: page,
      });
    }
  }, { passive: true });

  // Trackear scroll a sección de contacto (intención de presupuesto)
  // Sólo si existe #contacto en la página (no es el caso de /notas/)
  var contactoSection = document.getElementById('contacto');
  if (contactoSection && 'IntersectionObserver' in window) {
    var fired = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !fired) {
          fired = true;
          track('contacto_view', { page: location.pathname });
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    observer.observe(contactoSection);
  }
})();
