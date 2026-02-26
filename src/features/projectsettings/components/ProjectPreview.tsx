"use client";
import React, { useRef, useState, useEffect } from "react";

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
}

interface DesignSystem {
  colors?: ColorScheme;
  fontFamily?: string;
  letterTracking?: number;
  borderRadius?: number;
  spacing?: number;
  shadowStyle?: string;
}

interface ProjectPreviewProps {
  projectId: string;
  className?: string;
  colors?: ColorScheme;
  designSystem?: DesignSystem;
}

export function ProjectPreview({
  projectId,
  className = "",
  colors,
  designSystem,
}: ProjectPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateShadowVars = (style: string) => {
    const shadows: Record<string, string> = {
      sm: `--shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
      --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);`,
      md: `--shadow: 0px 2px 4px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
      --shadow-md: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);`,
      lg: `--shadow-lg: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);
      --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);`,
      xl: `--shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
      --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,
      "2xl": `--shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,
    };
    return shadows[style] || shadows.md;
  };

  const generateDesignSystemCSS = (system: DesignSystem) => {
    const colorScheme = system.colors ||
      colors || { primary: "#3b82f6", secondary: "#e0e7ff", accent: "#1e40af" };
    const fontFamily = system.fontFamily || "Inter";
    const letterTracking = system.letterTracking || 0;
    const borderRadius = system.borderRadius || 8;
    const spacing = system.spacing || 4;
    const shadowStyle = system.shadowStyle || "md";

    return `
      /* Design System Variables */
      :root {
        /* Colors */
        --color-primary: ${colorScheme.primary};
        --color-secondary: ${colorScheme.secondary};
        --color-accent: ${colorScheme.accent};
        --primary: ${colorScheme.primary};
        --secondary: ${colorScheme.secondary};
        --accent: ${colorScheme.accent};

        /* Typography */
        --font-sans: "${fontFamily}", ui-sans-serif, system-ui, sans-serif;
        --tracking-normal: ${letterTracking}em;

        /* Spacing */
        --spacing: ${spacing}px;

        /* Border Radius */
        --radius: ${borderRadius}px;
        --radius-sm: calc(var(--radius) - 4px);
        --radius-md: calc(var(--radius) - 2px);
        --radius-lg: var(--radius);
        --radius-xl: calc(var(--radius) + 4px);

        /* Shadows */
        ${generateShadowVars(shadowStyle)}
      }

      body {
        font-family: var(--font-sans);
        letter-spacing: var(--tracking-normal);
      }

      /* Color Utilities */
      .text-primary, [class*="text-primary"] {
        color: ${colorScheme.primary} !important;
      }

      .bg-primary, [class*="bg-primary"] {
        background-color: ${colorScheme.primary} !important;
      }

      .border-primary, [class*="border-primary"] {
        border-color: ${colorScheme.primary} !important;
      }

      .text-secondary, [class*="text-secondary"] {
        color: ${colorScheme.secondary} !important;
      }

      .bg-secondary, [class*="bg-secondary"] {
        background-color: ${colorScheme.secondary} !important;
      }

      .text-accent, [class*="text-accent"] {
        color: ${colorScheme.accent} !important;
      }

      .bg-accent, [class*="bg-accent"] {
        background-color: ${colorScheme.accent} !important;
      }
    `;
  };

  const generatePreviewHTML = (system: DesignSystem) => {
    const colorScheme = system.colors ||
      colors || { primary: "#3b82f6", secondary: "#e0e7ff", accent: "#1e40af" };
    const fontFamily = system.fontFamily || "Inter";
    const letterTracking = system.letterTracking || 0;
    const borderRadius = system.borderRadius || 8;
    const spacing = system.spacing || 4;
    const shadowStyle = system.shadowStyle || "md";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design System Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Lora:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    ${generateDesignSystemCSS(system)}

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

    /* Hero Section */
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

    /* Stats Grid */
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

    /* Content Cards */
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

    /* Button Section */
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

    /* Feature Grid */
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

    /* Typography Showcase */
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

    /* Footer Info */
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
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero Section -->
    <div class="hero">
      <span class="badge">Design System Preview</span>
      <h1>Your Custom Design System</h1>
      <p>Experience your design in action with comprehensive typography, spacing, colors, and effects. Every element reflects your choices in real-time.</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">99%</div>
        <div class="stat-label">Performance</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${fontFamily}</div>
        <div class="stat-label">Font Family</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${spacing}px</div>
        <div class="stat-label">Base Spacing</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${borderRadius}px</div>
        <div class="stat-label">Border Radius</div>
      </div>
    </div>

    <!-- Content Cards -->
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
        <p>Font family ${fontFamily} with ${
          letterTracking === 0 ? "default" : letterTracking.toFixed(3) + "em"
        } letter spacing ensures optimal readability and a consistent typographic rhythm across all content.</p>
      </div>
      <div class="card">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
          </svg>
        </div>
        <h2>Spacing Consistency</h2>
        <p>A ${spacing}px base spacing unit creates a mathematical rhythm throughout the design. Consistent spacing improves scanability and creates visual order.</p>
      </div>
    </div>

    <!-- Button Section -->
    <div class="button-section">
      <h3>Interactive Elements</h3>
      <div class="button-group">
        <button class="btn btn-primary">Primary Action</button>
        <button class="btn btn-secondary">Secondary Action</button>
        <button class="btn btn-accent">Accent Action</button>
        <button class="btn btn-outline">Outline Action</button>
      </div>
    </div>

    <!-- Feature Grid -->
    <div class="feature-section">
      <h3>Design System Components</h3>
      <div class="features">
        <div class="feature">
          <div class="feature-icon"></div>
          <h4>Colors</h4>
          <p>Harmonious palette with primary, secondary, and accent colors</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h4>Typography</h4>
          <p>Custom ${fontFamily} font with optimized spacing</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h4>Spacing</h4>
          <p>${spacing}px base unit for consistent rhythm</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h4>Borders</h4>
          <p>${borderRadius}px radius with full scale variants</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h4>Shadows</h4>
          <p>${shadowStyle.toUpperCase()} depth for visual hierarchy</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h4>Responsive</h4>
          <p>Fluid design that adapts to all screens</p>
        </div>
      </div>
    </div>

    <!-- Typography Showcase -->
    <div class="typography-showcase">
      <h3>Typography Scale</h3>
      <div class="type-examples">
        <div class="type-example">
          <h1>Heading 1 - Hero Headlines</h1>
          <p>Large, bold typography for primary headings and hero sections. Uses ${fontFamily} with ${
            letterTracking === 0 ? "default" : letterTracking.toFixed(3) + "em"
          } letter spacing.</p>
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
          <p><strong>Body Text:</strong> This is your standard body text with optimized line height and letter spacing for maximum readability. The ${fontFamily} font family was carefully chosen to ensure clarity across all devices and screen sizes.</p>
        </div>
      </div>
    </div>

    <!-- Design Tokens Info -->
    <div class="design-info">
      <h4>Active Design Tokens</h4>
      <div class="design-tokens">
        <div class="token">
          <div class="token-label">Primary</div>
          <div class="token-value">${colorScheme.primary}</div>
        </div>
        <div class="token">
          <div class="token-label">Secondary</div>
          <div class="token-value">${colorScheme.secondary}</div>
        </div>
        <div class="token">
          <div class="token-label">Accent</div>
          <div class="token-value">${colorScheme.accent}</div>
        </div>
        <div class="token">
          <div class="token-label">Font</div>
          <div class="token-value">${fontFamily}</div>
        </div>
        <div class="token">
          <div class="token-label">Tracking</div>
          <div class="token-value">${letterTracking.toFixed(3)}em</div>
        </div>
        <div class="token">
          <div class="token-label">Radius</div>
          <div class="token-value">${borderRadius}px</div>
        </div>
        <div class="token">
          <div class="token-label">Spacing</div>
          <div class="token-value">${spacing}px</div>
        </div>
        <div class="token">
          <div class="token-label">Shadow</div>
          <div class="token-value">${shadowStyle.toUpperCase()}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    try {
      const doc = iframe.contentDocument;
      doc.open();
      doc.write(generatePreviewHTML(designSystem || { colors }));
      doc.close();
    } catch (error) {
      console.log("Could not update iframe content:", error);
    }
  }, [colors, designSystem]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={`relative ${className} rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-sm font-medium text-gray-700">
              Loading preview...
            </p>
          </div>
        </div>
      )}

      {/* Custom Iframe Wrapper */}
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 bg-white"
          title="Website Preview"
          onLoad={handleIframeLoad}
          sandbox="allow-same-origin allow-scripts"
        />

        {/* Custom Preview Controls Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          {/* Design System Info Badge */}
          {(colors || designSystem) && (
            <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 p-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-gray-700">
                  Live Preview
                </span>
              </div>

              {/* Color Indicators */}
              <div className="flex gap-1.5 mb-2">
                <div
                  className="w-6 h-6 rounded-md border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor:
                      colors?.primary || designSystem?.colors?.primary,
                  }}
                  title="Primary Color"
                />
                <div
                  className="w-6 h-6 rounded-md border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor:
                      colors?.secondary || designSystem?.colors?.secondary,
                  }}
                  title="Secondary Color"
                />
                <div
                  className="w-6 h-6 rounded-md border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor:
                      colors?.accent || designSystem?.colors?.accent,
                  }}
                  title="Accent Color"
                />
              </div>

              {/* Typography Info */}
              {(designSystem?.fontFamily ||
                designSystem?.letterTracking !== undefined) && (
                <div className="text-xs text-gray-600 space-y-1 border-t pt-2">
                  {designSystem.fontFamily && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">Font:</span>
                      <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                        {designSystem.fontFamily}
                      </span>
                    </div>
                  )}
                  {designSystem.letterTracking !== undefined &&
                    designSystem.letterTracking !== 0 && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">Tracking:</span>
                        <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                          {designSystem.letterTracking.toFixed(3)}em
                        </span>
                      </div>
                    )}
                </div>
              )}

              {/* Spacing & Radius Info */}
              {(designSystem?.spacing || designSystem?.borderRadius) && (
                <div className="text-xs text-gray-600 space-y-1 border-t pt-2 mt-2">
                  {designSystem.spacing && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">Spacing:</span>
                      <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                        {designSystem.spacing}px
                      </span>
                    </div>
                  )}
                  {designSystem.borderRadius !== undefined && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">Radius:</span>
                      <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                        {designSystem.borderRadius}px
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Shadow Style Info */}
              {designSystem?.shadowStyle && (
                <div className="text-xs text-gray-600 border-t pt-2 mt-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">Shadow:</span>
                    <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                      {designSystem.shadowStyle}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 z-10">
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              <span className="font-medium">Ready</span>
            </div>
            <div className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded font-mono">
              Preview Mode
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
