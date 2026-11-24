import { projectCssToStyleTag } from "@/features/projects/lib/project-css";
import {
  generateDesignSystemCSS,
  resolveDesignSystemTokens,
  type DesignSystem,
  type ResolvedDesignSystem,
  type SimpleColorScheme,
} from "./designSystemUtils";

export { resolveDesignSystemTokens as resolvePreviewTokens };
export type { ResolvedDesignSystem as PreviewTokens };

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const PREVIEW_STATIC_CSS = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: linear-gradient(135deg, oklch(0.98 0.005 250) 0%, oklch(0.95 0.015 260) 100%);
      padding: 3rem 2rem;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .hero {
      background: white;
      padding: 4rem 3rem;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl, var(--shadow));
      margin-bottom: 3rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
    }

    .hero h1 {
      font-size: clamp(2rem, 5vw, 4rem);
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1.5rem;
      letter-spacing: var(--tracking-normal);
      line-height: 1.2;
    }

    .hero p {
      font-size: clamp(1rem, 2vw, 1.5rem);
      color: #64748b;
      letter-spacing: var(--tracking-normal);
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .badge {
      display: inline-block;
      padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 5);
      background: linear-gradient(135deg, var(--accent), var(--primary));
      color: white;
      border-radius: var(--radius-xl);
      font-size: 0.875rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      letter-spacing: calc(var(--tracking-normal) + 0.02em);
      text-transform: uppercase;
      box-shadow: var(--shadow-md, var(--shadow));
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: calc(var(--spacing) * 5);
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: calc(var(--spacing) * 6);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      text-align: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
    }

    .stat-card:hover {
      box-shadow: var(--shadow-2xl, var(--shadow-xl, var(--shadow)));
      border-color: var(--primary);
    }

    .stat-value {
      font-size: 3rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: var(--tracking-normal);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      color: #64748b;
      font-weight: 500;
      letter-spacing: var(--tracking-normal);
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: calc(var(--spacing) * 6);
      margin-bottom: 3rem;
    }

    .card {
      background: white;
      padding: calc(var(--spacing) * 8);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, var(--primary), var(--accent));
      transform: scaleY(0);
      transition: transform 0.3s ease;
    }

    .card:hover::before {
      transform: scaleY(1);
    }

    .card:hover {
      box-shadow: var(--shadow-2xl, var(--shadow-xl, var(--shadow)));
    }

    .card-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: calc(var(--spacing) * 4);
      box-shadow: var(--shadow-md, var(--shadow));
    }

    .card-icon svg {
      width: 28px;
      height: 28px;
      color: white;
    }

    .card h2 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: calc(var(--spacing) * 4);
      color: var(--primary);
      letter-spacing: var(--tracking-normal);
    }

    .card p {
      color: #64748b;
      line-height: 1.7;
      letter-spacing: var(--tracking-normal);
      font-size: 1.05rem;
    }

    .button-section {
      background: white;
      padding: 3rem;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow);
      margin-bottom: 3rem;
      text-align: center;
    }

    .button-section h3 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: var(--primary);
      letter-spacing: var(--tracking-normal);
    }

    .button-group {
      display: flex;
      gap: calc(var(--spacing) * 4);
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: calc(var(--spacing) * 4) calc(var(--spacing) * 8);
      border: none;
      border-radius: var(--radius);
      font-size: 1.05rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: var(--tracking-normal);
      font-family: var(--font-sans);
      box-shadow: var(--shadow);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white;
    }

    .btn-primary:hover {
      transform: scale(1.05) translateY(-2px);
      box-shadow: var(--shadow-lg, var(--shadow));
    }

    .btn-secondary {
      background-color: var(--secondary);
      color: var(--primary);
      border: 2px solid var(--primary);
    }

    .btn-secondary:hover {
      background-color: var(--primary);
      color: white;
      transform: scale(1.05) translateY(-2px);
    }

    .btn-accent {
      background-color: var(--accent);
      color: white;
    }

    .btn-accent:hover {
      opacity: 0.9;
      transform: scale(1.05) translateY(-2px);
      box-shadow: var(--shadow-lg, var(--shadow));
    }

    .btn-outline {
      background: transparent;
      color: var(--primary);
      border: 2px solid var(--primary);
    }

    .btn-outline:hover {
      background: var(--primary);
      color: white;
      transform: scale(1.05) translateY(-2px);
    }

    .feature-section {
      background: white;
      padding: 4rem 3rem;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow);
      margin-bottom: 3rem;
    }

    .feature-section h3 {
      font-size: 2.5rem;
      font-weight: 800;
      text-align: center;
      margin-bottom: 3rem;
      background: linear-gradient(135deg, var(--accent), var(--primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: var(--tracking-normal);
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: calc(var(--spacing) * 6);
    }

    .feature {
      text-align: center;
      padding: calc(var(--spacing) * 6);
      border: 2px solid var(--secondary);
      border-radius: var(--radius);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(135deg, transparent 0%, var(--secondary) 100%);
    }

    .feature:hover {
      border-color: var(--primary);
      background: var(--secondary);
      box-shadow: var(--shadow-lg, var(--shadow));
    }

    .feature-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-radius: 50%;
      margin: 0 auto calc(var(--spacing) * 4);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md, var(--shadow));
    }

    .feature h4 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: calc(var(--spacing) * 3);
      color: var(--primary);
      letter-spacing: var(--tracking-normal);
    }

    .feature p {
      color: #64748b;
      letter-spacing: var(--tracking-normal);
      line-height: 1.6;
    }

    .typography-showcase {
      background: white;
      padding: 4rem 3rem;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow);
      margin-bottom: 3rem;
    }

    .typography-showcase h3 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 3rem;
      text-align: center;
      color: var(--primary);
      letter-spacing: var(--tracking-normal);
    }

    .type-examples {
      display: grid;
      gap: calc(var(--spacing) * 8);
    }

    .type-example {
      border-left: 4px solid var(--accent);
      padding-left: calc(var(--spacing) * 6);
    }

    .type-example h1 { font-size: 3rem; font-weight: 800; color: var(--primary); margin-bottom: 1rem; }
    .type-example h2 { font-size: 2.5rem; font-weight: 700; color: var(--primary); margin-bottom: 1rem; }
    .type-example h3 { font-size: 2rem; font-weight: 700; color: var(--primary); margin-bottom: 1rem; }
    .type-example h4 { font-size: 1.5rem; font-weight: 600; color: var(--accent); margin-bottom: 1rem; }
    .type-example p { font-size: 1.125rem; color: #64748b; line-height: 1.8; letter-spacing: var(--tracking-normal); }

    .design-info {
      background: white;
      padding: 3rem;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow);
      border: 2px solid var(--primary);
    }

    .design-info h4 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: var(--primary);
      text-align: center;
    }

    .design-tokens {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: calc(var(--spacing) * 4);
    }

    .token {
      padding: calc(var(--spacing) * 4);
      background: var(--secondary);
      border-radius: var(--radius);
      text-align: center;
    }

    .token-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .token-value {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      color: #64748b;
      word-break: break-all;
    }
`;

function renderPreviewItems(
  items: ReadonlyArray<{ label: string; value: string }>,
  wrapperClass: string,
  renderItem: (item: { label: string; value: string }) => string,
): string {
  return `<div class="${wrapperClass}">${items.map(renderItem).join("")}</div>`;
}

export function generatePreviewHTML(
  system: DesignSystem,
  fallbackColors?: SimpleColorScheme,
  customCSS?: string,
): string {
  const tokens = resolveDesignSystemTokens(system, fallbackColors);
  const safeFont = escapeHtml(tokens.fontFamily);
  const trackingText =
    tokens.letterTracking === 0
      ? "default"
      : `${tokens.letterTracking.toFixed(3)}em`;
  const cssVariables = generateDesignSystemCSS(tokens);
  const customStyleTag = projectCssToStyleTag(customCSS);

  const statsHtml = renderPreviewItems(
    [
      { value: "99%", label: "Performance" },
      { value: safeFont, label: "Font Family" },
      { value: `${tokens.spacing}px`, label: "Base Spacing" },
      { value: `${tokens.borderRadius}px`, label: "Border Radius" },
    ],
    "stats-grid",
    (s) =>
      `<div class="stat-card"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`,
  );

  const cardsHtml = `
    <div class="cards">
      <div class="card">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </div>
        <h2>Color Harmony</h2>
        <p>Your carefully selected color palette creates visual hierarchy and guides user attention. Primary, secondary, and accent colors work together to establish brand identity.</p>
      </div>
      <div class="card">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2>Typography System</h2>
        <p>Font family ${safeFont} with ${trackingText} letter spacing ensures optimal readability and a consistent typographic rhythm across all content.</p>
      </div>
      <div class="card">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
          </svg>
        </div>
        <h2>Spacing Consistency</h2>
        <p>A ${tokens.spacing}px base spacing unit creates a mathematical rhythm throughout the design. Consistent spacing improves scanability and creates visual order.</p>
      </div>
    </div>`;

  const featuresHtml = renderPreviewItems(
    [
      { label: "Colors", value: "Harmonious palette with primary, secondary, and accent colors" },
      { label: "Typography", value: `Custom ${safeFont} font with optimized spacing` },
      { label: "Spacing", value: `${tokens.spacing}px base unit for consistent rhythm` },
      { label: "Borders", value: `${tokens.borderRadius}px radius with full scale variants` },
      { label: "Shadows", value: `${escapeHtml(tokens.shadowStyle.toUpperCase())} depth for visual hierarchy` },
      { label: "Responsive", value: "Fluid design that adapts to all screens" },
    ],
    "features",
    (f) =>
      `<div class="feature"><div class="feature-icon"></div><h4>${f.label}</h4><p>${f.value}</p></div>`,
  );

  const tokensHtml = renderPreviewItems(
    [
      { label: "Primary", value: escapeHtml(tokens.colors.primary) },
      { label: "Secondary", value: escapeHtml(tokens.colors.secondary) },
      { label: "Accent", value: escapeHtml(tokens.colors.accent) },
      { label: "Font", value: safeFont },
      { label: "Tracking", value: `${tokens.letterTracking.toFixed(3)}em` },
      { label: "Radius", value: `${tokens.borderRadius}px` },
      { label: "Spacing", value: `${tokens.spacing}px` },
      { label: "Shadow", value: escapeHtml(tokens.shadowStyle.toUpperCase()) },
    ],
    "design-tokens",
    (t) =>
      `<div class="token"><div class="token-label">${t.label}</div><div class="token-value">${t.value}</div></div>`,
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design System Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Lora:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${cssVariables}
    ${PREVIEW_STATIC_CSS}
  </style>
  ${customStyleTag}
</head>
<body>
  <div class="container">
    <div class="hero">
      <span class="badge">Design System Preview</span>
      <h1>Your Custom Design System</h1>
      <p>Experience your design in action with comprehensive typography, spacing, colors, and effects. Every element reflects your choices in real-time.</p>
    </div>
    ${statsHtml}
    ${cardsHtml}
    <div class="button-section">
      <h3>Interactive Elements</h3>
      <div class="button-group">
        <button class="btn btn-primary">Primary Action</button>
        <button class="btn btn-secondary">Secondary Action</button>
        <button class="btn btn-accent">Accent Action</button>
        <button class="btn btn-outline">Outline Action</button>
      </div>
    </div>
    <div class="feature-section">
      <h3>Design System Components</h3>
      ${featuresHtml}
    </div>
    <div class="typography-showcase">
      <h3>Typography Scale</h3>
      <div class="type-examples">
        <div class="type-example">
          <h1>Heading 1 - Hero Headlines</h1>
          <p>Large, bold typography for primary headings and hero sections. Uses ${safeFont} with ${trackingText} letter spacing.</p>
        </div>
        <div class="type-example">
          <h2>Heading 2 - Section Titles</h2>
          <p>Prominent section headings that organize content hierarchy and guide user navigation through the interface.</p>
        </div>
        <div class="type-example">
          <h3>Heading 3 - Subsections</h3>
          <p>Subsection headings that break content into digestible chunks while maintaining visual hierarchy.</p>
        </div>
        <div class="type-example">
          <h4>Heading 4 - Minor Titles</h4>
          <p>Smaller headings for cards, features, and minor content sections that need emphasis.</p>
        </div>
        <div class="type-example">
          <p><strong>Body Text:</strong> This is your standard body text with optimized line height and letter spacing for maximum readability. The ${safeFont} font family was carefully chosen to ensure clarity across all devices and screen sizes.</p>
        </div>
      </div>
    </div>
    <div class="design-info">
      <h4>Active Design Tokens</h4>
      ${tokensHtml}
    </div>
  </div>
</body>
</html>`;
}
