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

  const resourceMenuEl = document.getElementById('resource-menu');
  const detailBadgeEl = document.getElementById('resource-detail-badge');
  const detailTitleEl = document.getElementById('resource-detail-title');
  const detailDescriptionEl = document.getElementById('resource-detail-description');
  const detailActionsEl = document.getElementById('resource-detail-actions');
  const diagnosticsEl = document.getElementById('resource-diagnostics');
  const manualCountEl = document.getElementById('manual-download-count');
  const autoCountEl = document.getElementById('auto-download-count');
  const lastUpdateEl = document.getElementById('diag-last-update');

  if (resourceMenuEl && detailBadgeEl && detailTitleEl && detailDescriptionEl && detailActionsEl && diagnosticsEl) {
    const resources = [
      {
        id: 'interface-dlms',
        badge: 'InterfaceDLMS',
        title: 'Download Programma',
        description: "Scarica manualmente l'installer ufficiale o verifica le informazioni diagnostiche sugli aggiornamenti online.",
        showDiagnostics: true,
        actions: [
          {
            label: 'Download Manuale',
            href: '/interface-dlms/manual-download.php',
            secondary: false
          },
          {
            label: 'Apri Manifest Update',
            href: 'https://sysem.it/interface-dlms/update.json',
            secondary: true
          }
        ]
      },
      {
        id: 'digital-transformation',
        badge: 'PDF Guide',
        title: 'Digital Transformation',
        description: 'Una guida completa ai processi di digitalizzazione per le medie imprese nel 2024.',
        showDiagnostics: false,
        actions: [
          {
            label: 'Download Free',
            href: '#',
            secondary: false
          }
        ]
      },
      {
        id: 'project-roadmap',
        badge: 'Template',
        title: 'Project Roadmap',
        description: 'Template professionale per la gestione di progetti complessi, ottimizzato per team agili.',
        showDiagnostics: false,
        actions: [
          {
            label: 'Premium Access',
            href: '#',
            secondary: false
          }
        ]
      },
      {
        id: 'cybersecurity-101',
        badge: 'E-book',
        title: 'Cybersecurity 101',
        description: 'Tutto quello che la tua azienda deve sapere per proteggere i dati sensibili dagli attacchi moderni.',
        showDiagnostics: false,
        actions: [
          {
            label: 'Download Free',
            href: '#',
            secondary: false
          }
        ]
      }
    ];

    const renderActions = resource => {
      detailActionsEl.innerHTML = '';
      resource.actions.forEach(action => {
        const link = document.createElement('a');
        link.className = action.secondary ? 'btn-download btn-download-secondary' : 'btn-download';
        link.href = action.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = action.label;
        detailActionsEl.appendChild(link);
      });
    };

    const selectResource = resourceId => {
      const selected = resources.find(item => item.id === resourceId);
      if (!selected) {
        return;
      }

      detailBadgeEl.textContent = selected.badge;
      detailTitleEl.textContent = selected.title;
      detailDescriptionEl.textContent = selected.description;
      diagnosticsEl.hidden = !selected.showDiagnostics;
      renderActions(selected);

      const menuButtons = resourceMenuEl.querySelectorAll('.resource-menu-item');
      menuButtons.forEach(button => {
        const isActive = button.dataset.resourceId === selected.id;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
      });
    };

    resources.forEach((resource, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'resource-menu-item';
      button.dataset.resourceId = resource.id;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.textContent = resource.title;
      button.addEventListener('click', () => selectResource(resource.id));
      resourceMenuEl.appendChild(button);
    });

    selectResource(resources[0].id);
  }

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
