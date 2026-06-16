# Modifiche Status Bar Pagina AI

## Obiettivo
Ridurre l'invasività della hero section ("barra di stato") nella pagina Intelligenza Artificiale:
- Titolo "Intelligenza Artificiale" troppo grande
- Testo "Il mio clone digitale" che occupa troppo spazio

## File modificati

### 1. `ai.html`
```html
<!-- Prima -->
<section class="hero auth-hero" aria-labelledby="page-title">
  <p data-i18n="page.ai.overline">Innovazione</p>
  <h1 id="page-title" data-i18n="page.ai.title">Intelligenza Artificiale</h1>
  <div class="ai-frame">

<!-- Dopo -->
<section class="hero auth-hero" aria-labelledby="page-title">
  <p data-i18n="page.ai.overline">Innovazione</p>
  <h1 id="page-title" data-i18n="page.ai.title">Intelligenza Artificiale</h1>
  <p class="hero-subtitle" data-i18n="page.ai.subtitle">Il mio clone digitale</p>
  <div class="ai-frame">
```

### 2. `assets/lang/it.json`
```json
// Aggiunto nella sezione "page"
"ai": {
  "overline": "Innovazione",
  "title": "Intelligenza Artificiale",
  "subtitle": "Il mio clone digitale",
  "metaTitle": "AI"
}
```

### 3. `assets/css/style.css`
```css
/* Nuovi stili per ridurre dimensioni hero AI */
.auth-hero h1 {
  font-size: clamp(1.2rem, 3vw, 2rem);        /* Era: clamp(1.95rem, 6.4vw, 6rem) */
  padding: 8px 14px 6px;
  border-radius: 4px;
  box-shadow: 4px 4px 0 rgba(31, 26, 22, 0.06);
  letter-spacing: 0.04em;
  white-space: normal;
  animation: print-press 0.8s ease-out both;  /* Rimosso banner-flow infinite */
}

.auth-hero .hero-subtitle {
  margin-top: 8px;
  font-size: clamp(0.7rem, 1.2vw, 0.85rem);
  font-weight: 500;
  letter-spacing: 0.08em;
  color: rgba(31, 26, 22, 0.6);               /* Colore più tenue */
  text-transform: none;
}
```

## Confronto dimensioni

| Elemento | Prima | Dopo | Riduzione |
|----------|-------|------|-----------|
| Titolo (mobile) | 1.95rem | 1.2rem | ~38% |
| Titolo (desktop) | 6rem | 2rem | ~67% |
| Sottotitolo | N/A | 0.7-0.85rem | Nuovo, discreto |

## Note
- Il testo all'interno dell'iframe (`gianluca-ai-ten.vercel.app`) **non è modificabile** per policy cross-origin (CORS)
- L'animazione `banner-flow` (movimento infinito) è stata rimossa dal titolo per meno distrazione
- Mantenuta coerenza con stile `.auth-hero` usato anche in `access.html` e `admin.html`