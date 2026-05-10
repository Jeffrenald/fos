// Run: node scripts/generate-icons.js
const sharp = require('sharp');
const path  = require('path');

const ASSETS = path.join(__dirname, '../assets');

// ── Fòs App Icon (1024×1024) ──────────────────────────────────────────────────
// Dark background, teal lightning bolt, "Fòs" wordmark

const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#0A0A0A"/>

  <!-- Outer glow ring -->
  <circle cx="512" cy="440" r="260" fill="none"
    stroke="rgba(0,201,167,0.15)" stroke-width="40"/>

  <!-- Teal circle background -->
  <circle cx="512" cy="440" r="220" fill="rgba(0,201,167,0.12)"/>
  <circle cx="512" cy="440" r="220" fill="none"
    stroke="rgba(0,201,167,0.4)" stroke-width="2"/>

  <!-- Lightning bolt ⚡ -->
  <path d="M 555 240 L 460 460 L 530 460 L 465 660 L 590 400 L 518 400 Z"
    fill="#00C9A7"
    filter="url(#glow)"/>

  <!-- Glow filter -->
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Wordmark "Fòs" -->
  <text x="512" y="760"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="500"
    font-size="120"
    fill="#FFFFFF"
    letter-spacing="-2">Fòs</text>

  <!-- Tagline -->
  <text x="512" y="830"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="38"
    fill="rgba(0,201,167,0.7)"
    letter-spacing="6">DIASPORA FITNESS</text>
</svg>`;

// ── Splash screen (1284×2778 for iPhone 14 Pro Max) ───────────────────────────

const splashSvg = `
<svg width="1284" height="2778" viewBox="0 0 1284 2778" xmlns="http://www.w3.org/2000/svg">
  <rect width="1284" height="2778" fill="#0A0A0A"/>

  <!-- Subtle radial glow at center -->
  <radialGradient id="bg" cx="50%" cy="45%" r="40%">
    <stop offset="0%" stop-color="rgba(0,201,167,0.08)"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </radialGradient>
  <rect width="1284" height="2778" fill="url(#bg)"/>

  <!-- Glow ring -->
  <circle cx="642" cy="1200" r="320" fill="none"
    stroke="rgba(0,201,167,0.12)" stroke-width="60"/>

  <!-- Teal circle -->
  <circle cx="642" cy="1200" r="260" fill="rgba(0,201,167,0.1)"/>
  <circle cx="642" cy="1200" r="260" fill="none"
    stroke="rgba(0,201,167,0.35)" stroke-width="2"/>

  <!-- Lightning bolt -->
  <path d="M 695 960 L 580 1220 L 665 1220 L 585 1480 L 740 1150 L 650 1150 Z"
    fill="#00C9A7"/>

  <!-- Wordmark -->
  <text x="642" y="1620"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="600"
    font-size="160"
    fill="#FFFFFF"
    letter-spacing="-4">Fòs</text>

  <!-- Tagline -->
  <text x="642" y="1720"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="48"
    fill="rgba(0,201,167,0.65)"
    letter-spacing="8">DIASPORA FITNESS</text>

  <!-- Sub-tagline -->
  <text x="642" y="1800"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="36"
    fill="rgba(255,255,255,0.3)"
    letter-spacing="2">Built for you. In your language.</text>
</svg>`;

async function generate() {
  try {
    console.log('Generating app icon…');
    await sharp(Buffer.from(iconSvg))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(ASSETS, 'icon.png'));
    console.log('✅ assets/icon.png');

    console.log('Generating splash screen…');
    await sharp(Buffer.from(splashSvg))
      .resize(1284, 2778)
      .png()
      .toFile(path.join(ASSETS, 'splash.png'));
    console.log('✅ assets/splash.png');

    // Also create a smaller adaptive icon for Android
    await sharp(Buffer.from(iconSvg))
      .resize(1024, 1024)
      .png()
      .toFile(path.join(ASSETS, 'adaptive-icon.png'));
    console.log('✅ assets/adaptive-icon.png');

    console.log('\n🇭🇹 Fòs icons generated successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

generate();
