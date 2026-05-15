/**
 * Generates a self-contained HTML preview of a customer's website.
 *
 * Used by the /build flow at step 10 ("preview"). Returns a complete HTML
 * document ready to render in an iframe via the `srcDoc` prop.
 *
 * This is the STUB preview — a hand-styled template that uses the customer's
 * actual collected data (business name, photos, WhatsApp number, description).
 * Looks like a real website. When PR #5 lands the Claude Sonnet 4 generator,
 * this function gets replaced with an AI-generated equivalent — the rest of
 * the build flow stays identical.
 *
 * All user input is sanitized before insertion. The iframe is also sandboxed
 * with `sandbox="allow-popups allow-popups-to-escape-sandbox"` so any
 * residual XSS risk is contained.
 */

import { sanitize, type BuildState } from "./build-state";

const STOCK_INDUSTRY_PHOTOS_SERVICE = [
  // Inline SVG patterns — no external requests. Replaced with real CDN images
  // once we have media hosting.
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect fill='%23F5F2ED' width='400' height='400'/><rect x='160' y='160' width='80' height='80' fill='%2300C853' opacity='0.18'/><text x='200' y='350' font-family='sans-serif' font-size='14' fill='%237A756E' text-anchor='middle'>Industry photo</text></svg>",
];

export function generatePreviewHtml(state: BuildState): string {
  const businessName = sanitize(state.businessName || "Your Business");
  const tagline = sanitize(
    state.tagline ||
      `${state.businessName || "Your business"} — quality ${
        state.businessType === "Product" ? "products" : "service"
      }${state.city ? " in " + state.city : ""}.`
  );
  const description = sanitize(
    state.description ||
      "Tell us a bit more about what you do and we'll write this for you."
  );
  const city = sanitize(state.city);
  const province = sanitize(state.province);
  const waNumber = state.whatsappE164 || "+27000000000";
  const waLink = `https://wa.me/${waNumber.replace("+", "")}`;
  const photos =
    state.photoDataUrls.length > 0
      ? state.photoDataUrls
      : state.useIndustryPhotos
        ? STOCK_INDUSTRY_PHOTOS_SERVICE
        : [];
  const logo = state.logoDataUrl;

  // Build the description into 1-3 paragraphs so it reads like real copy.
  const paragraphs = description
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${businessName}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; }
  body { font-family: 'Inter', system-ui, sans-serif; color: #0A0A0A; line-height: 1.6; -webkit-font-smoothing: antialiased; }
  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
  a { color: inherit; }

  nav {
    position: sticky; top: 0; z-index: 10;
    background: rgba(255,255,255,0.95); backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(10,10,10,0.06);
    padding: 14px 0;
  }
  nav .inner { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
  .logo {
    font-family: 'Fraunces', Georgia, serif; font-style: italic;
    font-size: 22px; font-weight: 500; color: #0A0A0A; text-decoration: none;
  }
  .logo img { max-height: 40px; display: block; }
  nav a.cta {
    background: #00C853; color: #fff; padding: 10px 20px; border-radius: 999px;
    text-decoration: none; font-weight: 600; font-size: 14px;
    transition: background 150ms;
  }
  nav a.cta:hover { background: #009624; }

  .hero {
    padding: 96px 0 80px;
    background: linear-gradient(180deg, #F5F2ED 0%, #fff 100%);
    position: relative; overflow: hidden;
  }
  .hero::after {
    content: ''; position: absolute; top: -20%; right: -10%;
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,200,83,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero .container { position: relative; z-index: 1; }
  .hero h1 {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500;
    font-size: clamp(36px, 6vw, 64px); line-height: 1.05;
    letter-spacing: -0.025em; margin-bottom: 20px; max-width: 800px;
  }
  .hero p.lead {
    font-size: 19px; color: #555; max-width: 600px; margin-bottom: 36px;
    line-height: 1.5;
  }
  .hero .actions { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn {
    padding: 14px 28px; border-radius: 999px; text-decoration: none;
    font-weight: 600; font-size: 15px; display: inline-flex; align-items: center;
    gap: 8px; transition: all 150ms;
  }
  .btn-primary { background: #00C853; color: #fff; }
  .btn-primary:hover { background: #009624; }
  .btn-secondary {
    background: #fff; color: #0A0A0A;
    border: 1px solid rgba(10,10,10,0.12);
  }
  .btn-secondary:hover { border-color: rgba(10,10,10,0.3); }

  .gallery { padding: 80px 0; background: #fff; }
  .gallery h2 {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500;
    font-size: clamp(28px, 4vw, 40px); margin-bottom: 32px;
    letter-spacing: -0.02em;
  }
  .gallery .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }
  .gallery .grid > div {
    aspect-ratio: 1/1; border-radius: 16px; overflow: hidden;
    background: #F5F2ED;
  }
  .gallery img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .about { padding: 96px 0; background: #F5F2ED; }
  .about h2 {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500;
    font-size: clamp(28px, 4vw, 40px); margin-bottom: 24px;
    letter-spacing: -0.02em;
  }
  .about p {
    font-size: 17px; max-width: 720px; margin-bottom: 16px;
    line-height: 1.65;
  }

  .contact {
    padding: 96px 0;
    background: #0A0A0A; color: #fff;
  }
  .contact h2 {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500;
    font-size: clamp(28px, 4vw, 40px); margin-bottom: 32px;
    letter-spacing: -0.02em;
  }
  .contact .info { font-size: 18px; margin-bottom: 14px; color: rgba(255,255,255,0.85); }
  .contact .info strong { color: #fff; font-weight: 600; }
  .contact .actions { margin-top: 32px; }

  footer {
    background: #0A0A0A; color: rgba(255,255,255,0.5);
    padding: 24px 0; font-size: 13px; text-align: center;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  footer a { color: #00C853; text-decoration: none; }

  @media (max-width: 600px) {
    .hero { padding: 72px 0 56px; }
    .hero h1 { font-size: 34px; }
    .gallery, .about, .contact { padding: 64px 0; }
  }
</style>
</head>
<body>

<nav>
  <div class="container inner">
    ${
      logo
        ? `<img class="logo" src="${logo}" alt="${businessName}">`
        : `<span class="logo">${businessName}</span>`
    }
    <a class="cta" href="${waLink}">💬 WhatsApp</a>
  </div>
</nav>

<header class="hero">
  <div class="container">
    <h1>${tagline}</h1>
    <p class="lead">${paragraphs[0] || description}</p>
    <div class="actions">
      <a class="btn btn-primary" href="${waLink}">💬 Chat on WhatsApp</a>
      <a class="btn btn-secondary" href="#contact">Get in touch</a>
    </div>
  </div>
</header>

${
  photos.length > 0
    ? `<section class="gallery">
  <div class="container">
    <h2>${state.businessType === "Product" ? "Our products" : "Our work"}</h2>
    <div class="grid">
      ${photos.map((p) => `<div><img src="${p}" alt=""></div>`).join("")}
    </div>
  </div>
</section>`
    : ""
}

<section class="about">
  <div class="container">
    <h2>About ${businessName}</h2>
    ${
      paragraphs.length > 1
        ? paragraphs.map((p) => `<p>${p}</p>`).join("")
        : `<p>${description}</p>`
    }
  </div>
</section>

<section class="contact" id="contact">
  <div class="container">
    <h2>Get in touch</h2>
    <p class="info"><strong>WhatsApp:</strong> ${waNumber}</p>
    ${
      city
        ? `<p class="info"><strong>Based in:</strong> ${city}${province ? ", " + province : ""}</p>`
        : ""
    }
    <div class="actions">
      <a class="btn btn-primary" href="${waLink}">💬 Message us on WhatsApp</a>
    </div>
  </div>
</section>

<footer>
  <div class="container">
    <p>© ${new Date().getFullYear()} ${businessName} · powered by <a href="https://quicka.website">Quicka</a></p>
  </div>
</footer>

</body>
</html>`;
}
