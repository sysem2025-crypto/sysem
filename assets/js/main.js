document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const overlayMenu = document.getElementById('overlay-menu');
  const body = document.body;

  if (menuToggle && overlayMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      overlayMenu.classList.toggle('active');
      
      // Prevent scrolling when menu is open
      if (overlayMenu.classList.contains('active')) {
        body.style.overflow = 'hidden';
      } else {
        body.style.overflow = '';
      }
    });

    // Close menu when clicking on a link
    const menuLinks = overlayMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        overlayMenu.classList.remove('active');
        body.style.overflow = '';
      });
    });
  }

  const manualCountEl = document.getElementById('manual-download-count');
  const autoCountEl = document.getElementById('auto-download-count');
  const lastUpdateEl = document.getElementById('diag-last-update');

  if (manualCountEl && autoCountEl && lastUpdateEl) {
    const diagnosticsUrl = '/interface-dlms/stats.php';

    fetch(diagnosticsUrl, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Diagnostics not available');
        }
        return response.json();
      })
      .then(data => {
        const manualValue = Number.isFinite(data.manual_downloads) ? data.manual_downloads : '--';
        const autoValue = Number.isFinite(data.automatic_downloads) ? data.automatic_downloads : '--';
        const lastUpdateValue = typeof data.last_update === 'string' && data.last_update.trim()
          ? data.last_update
          : '--';

        manualCountEl.textContent = String(manualValue);
        autoCountEl.textContent = String(autoValue);
        lastUpdateEl.textContent = lastUpdateValue;
      })
      .catch(() => {
        manualCountEl.textContent = '--';
        autoCountEl.textContent = '--';
        lastUpdateEl.textContent = 'n/d';
      });
  }
});
