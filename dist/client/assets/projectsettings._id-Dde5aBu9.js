import{r as c,j as e,a4 as x,I as de,_ as ie,u as ce,a5 as le,a6 as me,g as pe,p as U,a7 as ge,B as Y,a as J}from"./main-DgIhHc0_.js";import{C,b as $,c as P,d as T,a as z}from"./card-CtehNXk2.js";import{T as ue,a as xe,b as M,c as B}from"./tabs-nND9Hy2d.js";import{S as q,a as _,b as Q,c as W,d as X}from"./select-BffgijTJ.js";import{S as A}from"./slider-CbvDWqS9.js";import fe from"./arrow-left-D5CcVRlm.js";import he from"./save-Bod67DlD.js";import K from"./palette-CTTXPo6O.js";import Z from"./type-BnlZw9La.js";import ee from"./move-Bms9sB1D.js";import ve from"./eye-DjRCYoEm.js";import"./index-BBtjaZKc.js";import"./index-DZfngzqd.js";import"./index-BdQq_4o_.js";import"./index-BP9UjFNG.js";function be({projectId:a,className:o="",colors:d,designSystem:s}){const l=c.useRef(null),[y,h]=c.useState(!0),w=n=>{const t={sm:`--shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
      --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);`,md:`--shadow: 0px 2px 4px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
      --shadow-md: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);`,lg:`--shadow-lg: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);
      --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);`,xl:`--shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
      --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,"2xl":"--shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);"};return t[n]||t.md},F=n=>{const t=n.colors||d||{primary:"#3b82f6",secondary:"#e0e7ff",accent:"#1e40af"},f=n.fontFamily||"Inter",v=n.letterTracking||0,j=n.borderRadius||8,b=n.spacing||4,m=n.shadowStyle||"md";return`
      /* Design System Variables */
      :root {
        /* Colors */
        --color-primary: ${t.primary};
        --color-secondary: ${t.secondary};
        --color-accent: ${t.accent};
        --primary: ${t.primary};
        --secondary: ${t.secondary};
        --accent: ${t.accent};

        /* Typography */
        --font-sans: "${f}", ui-sans-serif, system-ui, sans-serif;
        --tracking-normal: ${v}em;

        /* Spacing */
        --spacing: ${b}px;

        /* Border Radius */
        --radius: ${j}px;
        --radius-sm: calc(var(--radius) - 4px);
        --radius-md: calc(var(--radius) - 2px);
        --radius-lg: var(--radius);
        --radius-xl: calc(var(--radius) + 4px);

        /* Shadows */
        ${w(m)}
      }

      body {
        font-family: var(--font-sans);
        letter-spacing: var(--tracking-normal);
      }

      /* Color Utilities */
      .text-primary, [class*="text-primary"] {
        color: ${t.primary} !important;
      }

      .bg-primary, [class*="bg-primary"] {
        background-color: ${t.primary} !important;
      }

      .border-primary, [class*="border-primary"] {
        border-color: ${t.primary} !important;
      }

      .text-secondary, [class*="text-secondary"] {
        color: ${t.secondary} !important;
      }

      .bg-secondary, [class*="bg-secondary"] {
        background-color: ${t.secondary} !important;
      }

      .text-accent, [class*="text-accent"] {
        color: ${t.accent} !important;
      }

      .bg-accent, [class*="bg-accent"] {
        background-color: ${t.accent} !important;
      }
    `},L=n=>{const t=n.colors||d||{primary:"#3b82f6",secondary:"#e0e7ff",accent:"#1e40af"},f=n.fontFamily||"Inter",v=n.letterTracking||0,j=n.borderRadius||8,b=n.spacing||4,m=n.shadowStyle||"md";return`
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

    ${F(n)}

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
        <div class="stat-value">${f}</div>
        <div class="stat-label">Font Family</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${b}px</div>
        <div class="stat-label">Base Spacing</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${j}px</div>
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
        <p>Font family ${f} with ${v===0?"default":v.toFixed(3)+"em"} letter spacing ensures optimal readability and a consistent typographic rhythm across all content.</p>
      </div>
      <div class="card">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
          </svg>
        </div>
        <h2>Spacing Consistency</h2>
        <p>A ${b}px base spacing unit creates a mathematical rhythm throughout the design. Consistent spacing improves scanability and creates visual order.</p>
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
          <p>Custom ${f} font with optimized spacing</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h4>Spacing</h4>
          <p>${b}px base unit for consistent rhythm</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h4>Borders</h4>
          <p>${j}px radius with full scale variants</p>
        </div>
        <div class="feature">
          <div class="feature-icon"></div>
          <h4>Shadows</h4>
          <p>${m.toUpperCase()} depth for visual hierarchy</p>
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
          <p>Large, bold typography for primary headings and hero sections. Uses ${f} with ${v===0?"default":v.toFixed(3)+"em"} letter spacing.</p>
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
          <p><strong>Body Text:</strong> This is your standard body text with optimized line height and letter spacing for maximum readability. The ${f} font family was carefully chosen to ensure clarity across all devices and screen sizes.</p>
        </div>
      </div>
    </div>

    <!-- Design Tokens Info -->
    <div class="design-info">
      <h4>Active Design Tokens</h4>
      <div class="design-tokens">
        <div class="token">
          <div class="token-label">Primary</div>
          <div class="token-value">${t.primary}</div>
        </div>
        <div class="token">
          <div class="token-label">Secondary</div>
          <div class="token-value">${t.secondary}</div>
        </div>
        <div class="token">
          <div class="token-label">Accent</div>
          <div class="token-value">${t.accent}</div>
        </div>
        <div class="token">
          <div class="token-label">Font</div>
          <div class="token-value">${f}</div>
        </div>
        <div class="token">
          <div class="token-label">Tracking</div>
          <div class="token-value">${v.toFixed(3)}em</div>
        </div>
        <div class="token">
          <div class="token-label">Radius</div>
          <div class="token-value">${j}px</div>
        </div>
        <div class="token">
          <div class="token-label">Spacing</div>
          <div class="token-value">${b}px</div>
        </div>
        <div class="token">
          <div class="token-label">Shadow</div>
          <div class="token-value">${m.toUpperCase()}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `};c.useEffect(()=>{const n=l.current;if(!(!n||!n.contentDocument))try{const t=n.contentDocument;t.open(),t.write(L(s||{colors:d})),t.close()}catch(t){console.log("Could not update iframe content:",t)}},[d,s]);const D=()=>{h(!1)};return e.jsxs("div",{className:`relative ${o} rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200`,children:[y&&e.jsx("div",{className:"absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10",children:e.jsxs("div",{className:"flex flex-col items-center space-y-3",children:[e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"}),e.jsx("p",{className:"text-sm font-medium text-gray-700",children:"Loading preview..."})]})}),e.jsxs("div",{className:"relative w-full h-full",children:[e.jsx("iframe",{ref:l,className:"w-full h-full border-0 bg-white",title:"Website Preview",onLoad:D,sandbox:"allow-same-origin allow-scripts"}),e.jsx("div",{className:"absolute top-3 right-3 flex flex-col gap-2 z-20",children:(d||s)&&e.jsxs("div",{className:"bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 p-2",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx("div",{className:"w-2 h-2 rounded-full bg-green-500 animate-pulse"}),e.jsx("span",{className:"text-xs font-semibold text-gray-700",children:"Live Preview"})]}),e.jsxs("div",{className:"flex gap-1.5 mb-2",children:[e.jsx("div",{className:"w-6 h-6 rounded-md border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer",style:{backgroundColor:d?.primary||s?.colors?.primary},title:"Primary Color"}),e.jsx("div",{className:"w-6 h-6 rounded-md border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer",style:{backgroundColor:d?.secondary||s?.colors?.secondary},title:"Secondary Color"}),e.jsx("div",{className:"w-6 h-6 rounded-md border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer",style:{backgroundColor:d?.accent||s?.colors?.accent},title:"Accent Color"})]}),(s?.fontFamily||s?.letterTracking!==void 0)&&e.jsxs("div",{className:"text-xs text-gray-600 space-y-1 border-t pt-2",children:[s.fontFamily&&e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx("span",{className:"font-medium",children:"Font:"}),e.jsx("span",{className:"font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded",children:s.fontFamily})]}),s.letterTracking!==void 0&&s.letterTracking!==0&&e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx("span",{className:"font-medium",children:"Tracking:"}),e.jsxs("span",{className:"font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded",children:[s.letterTracking.toFixed(3),"em"]})]})]}),(s?.spacing||s?.borderRadius)&&e.jsxs("div",{className:"text-xs text-gray-600 space-y-1 border-t pt-2 mt-2",children:[s.spacing&&e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx("span",{className:"font-medium",children:"Spacing:"}),e.jsxs("span",{className:"font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded",children:[s.spacing,"px"]})]}),s.borderRadius!==void 0&&e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx("span",{className:"font-medium",children:"Radius:"}),e.jsxs("span",{className:"font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded",children:[s.borderRadius,"px"]})]})]}),s?.shadowStyle&&e.jsx("div",{className:"text-xs text-gray-600 border-t pt-2 mt-2",children:e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx("span",{className:"font-medium",children:"Shadow:"}),e.jsx("span",{className:"font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded uppercase",children:s.shadowStyle})]})})]})}),e.jsx("div",{className:"absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 z-10",children:e.jsxs("div",{className:"flex items-center justify-between text-white text-xs",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-green-400"}),e.jsx("span",{className:"font-medium",children:"Ready"})]}),e.jsx("div",{className:"bg-black/30 backdrop-blur-sm px-2 py-1 rounded font-mono",children:"Preview Mode"})]})})]})]})}function ye({label:a,value:o,onChange:d,placeholder:s,bgClass:l="",id:y}){return e.jsxs("div",{className:"text-center space-y-3",children:[e.jsxs(x,{className:"text-sm font-bold text-foreground flex items-center justify-center gap-2",style:{letterSpacing:"var(--tracking-normal)"},children:[e.jsx("div",{className:`w-3 h-3 rounded-full ${l}`,style:l?{}:{backgroundColor:o}}),a]}),e.jsx("div",{className:"relative mx-auto w-fit",children:e.jsx("input",{type:"color",id:y,value:o,onChange:h=>d(h.target.value),className:"w-16 h-16 rounded-[var(--radius-lg)] border-2 border-border shadow-[var(--shadow-md)] cursor-pointer mx-auto"})}),e.jsx(de,{value:o,onChange:h=>d(h.target.value),className:"font-mono text-xs border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-[var(--radius)] bg-card text-center",style:{letterSpacing:"var(--tracking-normal)"},placeholder:s})]})}function we(a){const o={sm:`  --shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
  --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);`,md:`  --shadow: 0px 2px 4px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow-md: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);`,lg:`  --shadow-lg: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);
  --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);`,xl:`  --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,"2xl":"  --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);"};return o[a]||o.md}function je(a){const o=a.colors||{primary:"#3b82f6",secondary:"#e0e7ff",accent:"#1e40af"},d=a.fontFamily||"Inter",s=a.letterTracking||0,l=a.borderRadius||8,y=a.spacing||4,h=a.shadowStyle||"md";return`
/* Design System Variables */
:root {
  /* Colors */
  --color-primary: ${o.primary};
  --color-secondary: ${o.secondary};
  --color-accent: ${o.accent};
  --primary: ${o.primary};
  --secondary: ${o.secondary};
  --accent: ${o.accent};

  /* Typography */
  --font-sans: "${d}", ui-sans-serif, system-ui, sans-serif;
  --tracking-normal: ${s}em;

  /* Spacing */
  --spacing: ${y}px;

  /* Border Radius */
  --radius: ${l}px;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  /* Shadows */
${we(h)}
}

body {
  font-family: var(--font-sans);
  letter-spacing: var(--tracking-normal);
}

/* Color Utilities */
.text-primary, [class*="text-primary"] {
  color: ${o.primary} !important;
}

.bg-primary, [class*="bg-primary"] {
  background-color: ${o.primary} !important;
}

.border-primary, [class*="border-primary"] {
  border-color: ${o.primary} !important;
}

.text-secondary, [class*="text-secondary"] {
  color: ${o.secondary} !important;
}

.bg-secondary, [class*="bg-secondary"] {
  background-color: ${o.secondary} !important;
}

.text-accent, [class*="text-accent"] {
  color: ${o.accent} !important;
}

.bg-accent, [class*="bg-accent"] {
  background-color: ${o.accent} !important;
}
`}function ke(a){return`
:root {
  /* Primary Colors */
  --color-primary: ${a.primary};
  --primary: ${a.primary};
  --primary-foreground: ${a.primaryForeground};

  /* Secondary Colors */
  --color-secondary: ${a.secondary};
  --secondary: ${a.secondary};
  --secondary-foreground: ${a.secondaryForeground};

  /* Accent Colors */
  --color-accent: ${a.accent};
  --accent: ${a.accent};
  --accent-foreground: ${a.accentForeground};

  /* Background Colors */
  --background: ${a.background};
  --foreground: ${a.foreground};

  /* Card Colors */
  --card: ${a.card};
  --card-foreground: ${a.cardForeground};

  /* Muted Colors */
  --muted: ${a.muted};
  --muted-foreground: ${a.mutedForeground};

  /* Border */
  --border: ${a.border};

  /* Destructive Colors */
  --destructive: ${a.destructive};
  --destructive-foreground: ${a.destructiveForeground};
}

/* Utility Classes */
.bg-primary {
  background-color: ${a.primary} !important;
}

.text-primary {
  color: ${a.primary} !important;
}

.text-primary-foreground {
  color: ${a.primaryForeground} !important;
}

.bg-secondary {
  background-color: ${a.secondary} !important;
}

.text-secondary-foreground {
  color: ${a.secondaryForeground} !important;
}

.bg-accent {
  background-color: ${a.accent} !important;
}

.text-accent-foreground {
  color: ${a.accentForeground} !important;
}

.bg-card {
  background-color: ${a.card} !important;
}

.text-card-foreground {
  color: ${a.cardForeground} !important;
}

.bg-muted {
  background-color: ${a.muted} !important;
}

.text-muted-foreground {
  color: ${a.mutedForeground} !important;
}

.border-primary {
  border-color: ${a.primary} !important;
}

.border-border {
  border-color: ${a.border} !important;
}

.bg-destructive {
  background-color: ${a.destructive} !important;
}

.text-destructive-foreground {
  color: ${a.destructiveForeground} !important;
}

/* Hover States */
.hover\\:bg-primary\\/90:hover {
  background-color: ${a.primary}e6 !important;
}

.hover\\:bg-secondary\\/90:hover {
  background-color: ${a.secondary}e6 !important;
}

.hover\\:bg-accent\\/90:hover {
  background-color: ${a.accent}e6 !important;
}
`}const Ne=[{name:"Blue Ocean",colors:{primary:"#3b82f6",primaryForeground:"#ffffff",secondary:"#e0e7ff",secondaryForeground:"#1e3a8a",accent:"#1e40af",accentForeground:"#ffffff",background:"#ffffff",foreground:"#0f172a",card:"#f8fafc",cardForeground:"#0f172a",muted:"#f1f5f9",mutedForeground:"#64748b",border:"#e2e8f0",destructive:"#ef4444",destructiveForeground:"#ffffff"}},{name:"Green Forest",colors:{primary:"#10b981",primaryForeground:"#ffffff",secondary:"#d1fae5",secondaryForeground:"#065f46",accent:"#047857",accentForeground:"#ffffff",background:"#ffffff",foreground:"#0f172a",card:"#f0fdf4",cardForeground:"#0f172a",muted:"#dcfce7",mutedForeground:"#166534",border:"#bbf7d0",destructive:"#ef4444",destructiveForeground:"#ffffff"}},{name:"Purple Magic",colors:{primary:"#8b5cf6",primaryForeground:"#ffffff",secondary:"#ede9fe",secondaryForeground:"#5b21b6",accent:"#5b21b6",accentForeground:"#ffffff",background:"#ffffff",foreground:"#0f172a",card:"#faf5ff",cardForeground:"#0f172a",muted:"#f3e8ff",mutedForeground:"#7c3aed",border:"#e9d5ff",destructive:"#ef4444",destructiveForeground:"#ffffff"}},{name:"Orange Sunset",colors:{primary:"#f59e0b",primaryForeground:"#ffffff",secondary:"#fef3c7",secondaryForeground:"#92400e",accent:"#d97706",accentForeground:"#ffffff",background:"#ffffff",foreground:"#0f172a",card:"#fffbeb",cardForeground:"#0f172a",muted:"#fef3c7",mutedForeground:"#b45309",border:"#fde68a",destructive:"#ef4444",destructiveForeground:"#ffffff"}},{name:"Red Passion",colors:{primary:"#ef4444",primaryForeground:"#ffffff",secondary:"#fee2e2",secondaryForeground:"#991b1b",accent:"#dc2626",accentForeground:"#ffffff",background:"#ffffff",foreground:"#0f172a",card:"#fef2f2",cardForeground:"#0f172a",muted:"#fecaca",mutedForeground:"#b91c1c",border:"#fca5a5",destructive:"#dc2626",destructiveForeground:"#ffffff"}},{name:"Pink Rose",colors:{primary:"#ec4899",primaryForeground:"#ffffff",secondary:"#fce7f3",secondaryForeground:"#9f1239",accent:"#be185d",accentForeground:"#ffffff",background:"#ffffff",foreground:"#0f172a",card:"#fdf2f8",cardForeground:"#0f172a",muted:"#fbcfe8",mutedForeground:"#db2777",border:"#f9a8d4",destructive:"#ef4444",destructiveForeground:"#ffffff"}}],Se=[{value:"Inter",label:"Inter (Sans)"},{value:"Lora",label:"Lora (Serif)"},{value:"JetBrains Mono",label:"JetBrains Mono (Mono)"}],re=[{value:"sm",label:"Small",shadow:"0px 1px 2px 0px hsl(0 0% 0% / 0.05)"},{value:"md",label:"Medium",shadow:"0px 2px 4px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1)"},{value:"lg",label:"Large",shadow:"0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1)"},{value:"xl",label:"Extra Large",shadow:"0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1)"},{value:"2xl",label:"2X Large",shadow:"0px 25px 50px -12px hsl(0 0% 0% / 0.25)"}];function Fe(){const a=ie({strict:!1}),o=ce(),d=le(),{updateProject:s}=me(),l=a.id,[y,h]=c.useState(""),[w,F]=c.useState({primary:"#3b82f6",primaryForeground:"#ffffff",secondary:"#e0e7ff",secondaryForeground:"#1e3a8a",accent:"#1e40af",accentForeground:"#ffffff",background:"#ffffff",foreground:"#0f172a",card:"#f8fafc",cardForeground:"#0f172a",muted:"#f1f5f9",mutedForeground:"#64748b",border:"#e2e8f0",destructive:"#ef4444",destructiveForeground:"#ffffff"}),[L,D]=c.useState(""),[n,t]=c.useState(""),[f,v]=c.useState(!1),[j,b]=c.useState(""),[m,H]=c.useState("Inter"),[N,V]=c.useState(0),[p,E]=c.useState(8),[i,O]=c.useState(4),[R,G]=c.useState("md"),ae=[{key:"primary",label:"Primary",bgClass:"bg-primary",placeholder:"#3b82f6"},{key:"primaryForeground",label:"Primary FG",bgClass:"",placeholder:"#ffffff"},{key:"secondary",label:"Secondary",bgClass:"bg-secondary",placeholder:"#e0e7ff"},{key:"secondaryForeground",label:"Secondary FG",bgClass:"",placeholder:"#1e3a8a"},{key:"accent",label:"Accent",bgClass:"bg-accent",placeholder:"#1e40af"},{key:"accentForeground",label:"Accent FG",bgClass:"",placeholder:"#ffffff"},{key:"background",label:"Background",bgClass:"",placeholder:"#ffffff"},{key:"foreground",label:"Foreground",bgClass:"",placeholder:"#0f172a"},{key:"card",label:"Card",bgClass:"",placeholder:"#f8fafc"},{key:"cardForeground",label:"Card FG",bgClass:"",placeholder:"#0f172a"},{key:"muted",label:"Muted",bgClass:"",placeholder:"#f1f5f9"},{key:"mutedForeground",label:"Muted FG",bgClass:"",placeholder:"#64748b"},{key:"border",label:"Border",bgClass:"",placeholder:"#e2e8f0"},{key:"destructive",label:"Destructive",bgClass:"",placeholder:"#ef4444"},{key:"destructiveForeground",label:"Destructive FG",bgClass:"",placeholder:"#ffffff"}],{data:u,error:Ce,isLoading:te}=pe({queryKey:["project",l],queryFn:()=>U.getProjectById(l),enabled:!!l}),I=ge({mutationFn:r=>{const{id:g,createdAt:k,updatedAt:S,deletedAt:$e,ownerId:Pe,...ne}=r;return U.updateProjectPartial(g,ne)},onSuccess:r=>{d.setQueryData(["project",l],r),s(r),console.log("Project updated successfully!")},onError:r=>{let g="Failed to update project";try{if(r&&typeof r=="object"&&r.message){g=String(r.message);const k=g.match(/\{[\s\S]*\}/);if(k){const S=JSON.parse(k[0]);g=S.errorMessage||S.message||JSON.stringify(S)}}}catch{}console.error("Update error:",r),console.error("Server message:",g),alert(`Update failed: ${g}`)}});c.useEffect(()=>{if(u&&(D(u.name||""),t(u.description||""),v(u.published||!1),b(u.subdomain||""),u.header?.cssStyles&&h(u.header.cssStyles||""),u.styles&&typeof u.styles=="object")){const r=u.styles;F({primary:r.primary||"#3b82f6",primaryForeground:r.primaryForeground||"#ffffff",secondary:r.secondary||"#e0e7ff",secondaryForeground:r.secondaryForeground||"#1e3a8a",accent:r.accent||"#1e40af",accentForeground:r.accentForeground||"#ffffff",background:r.background||"#ffffff",foreground:r.foreground||"#0f172a",card:r.card||"#f8fafc",cardForeground:r.cardForeground||"#0f172a",muted:r.muted||"#f1f5f9",mutedForeground:r.mutedForeground||"#64748b",border:r.border||"#e2e8f0",destructive:r.destructive||"#ef4444",destructiveForeground:r.destructiveForeground||"#ffffff"}),H(r.fontFamily||"Inter"),V(r.letterTracking||0),E(r.borderRadius||8),O(r.spacing||4),G(r.shadowStyle||"md")}},[u]);const se=r=>{F(r)},oe=()=>{const r=ke(w),g=je({fontFamily:m,letterTracking:N,borderRadius:p,spacing:i,shadowStyle:R}),k=y+`

/* Auto-generated Design System */
`+g+`

/* Auto-generated Color Scheme */
`+r,S={id:l,name:L,description:n,published:f,subdomain:j,header:{...u?.header,cssStyles:k},styles:{...w,fontFamily:m,borderRadius:p,spacing:i,letterTracking:N,shadowStyle:R}};I.mutate(S)};return te?e.jsx("div",{className:"h-screen flex items-center justify-center mx-auto",children:e.jsx("div",{className:"animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"})}):e.jsx("div",{className:"min-h-screen bg-background p-6 w-full",children:e.jsxs("div",{className:"max-w-7xl mx-auto",children:[e.jsxs("div",{className:"flex items-center justify-between mb-8 p-6 bg-card rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-border",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs(Y,{variant:"ghost",size:"sm",onClick:()=>o({to:"/dashboard"}),className:"flex items-center gap-2 rounded-[var(--radius)]",children:[e.jsx(fe,{className:"w-4 h-4"}),"Back"]}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold text-primary",style:{letterSpacing:"var(--tracking-normal)"},children:"Project Settings"}),e.jsx("p",{className:"text-muted-foreground text-lg",style:{letterSpacing:"var(--tracking-normal)"},children:"Customize your project appearance and styles"})]})]}),e.jsxs(Y,{onClick:oe,disabled:I.isPending,className:"flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-[var(--radius-lg)] shadow-[var(--shadow)]",children:[e.jsx(he,{className:"w-5 h-5"}),I.isPending?"Saving...":"Save Changes"]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-8",children:[e.jsx("div",{className:"space-y-6",children:e.jsxs(ue,{defaultValue:"colors",className:"w-full",children:[e.jsxs(xe,{className:"grid w-full grid-cols-4 bg-card shadow-[var(--shadow)] rounded-[var(--radius-lg)] p-1 border border-border",children:[e.jsxs(M,{value:"colors",className:"flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]",style:{letterSpacing:"var(--tracking-normal)"},children:[e.jsx(K,{className:"w-4 h-4"}),e.jsx("span",{className:"hidden sm:inline",children:"Colors"})]}),e.jsxs(M,{value:"typography",className:"flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]",style:{letterSpacing:"var(--tracking-normal)"},children:[e.jsx(Z,{className:"w-4 h-4"}),e.jsx("span",{className:"hidden sm:inline",children:"Typography"})]}),e.jsxs(M,{value:"spacing",className:"flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]",style:{letterSpacing:"var(--tracking-normal)"},children:[e.jsx(ee,{className:"w-4 h-4"}),e.jsx("span",{className:"hidden sm:inline",children:"Spacing"})]}),e.jsxs(M,{value:"effects",className:"flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]",style:{letterSpacing:"var(--tracking-normal)"},children:[e.jsx(J,{className:"w-4 h-4"}),e.jsx("span",{className:"hidden sm:inline",children:"Effects"})]})]}),e.jsx(B,{value:"colors",className:"mt-6",children:e.jsxs(C,{className:"border-0 shadow-[var(--shadow-lg)] bg-card",children:[e.jsxs($,{className:"rounded-t-[var(--radius-lg)]",children:[e.jsxs(P,{className:"flex items-center gap-2 text-lg text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:[e.jsx(K,{className:"w-5 h-5 text-primary"}),"Color Scheme"]}),e.jsx(T,{className:"text-muted-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"Choose colors for your project theme"})]}),e.jsxs(z,{className:"space-y-6",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsx(x,{className:"text-base font-semibold text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"Custom Colors"}),e.jsx("div",{className:"p-6 rounded-[var(--radius-lg)] border-2 border-border bg-muted/50",children:e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",children:ae.map(r=>e.jsx(ye,{label:r.label,value:w[r.key],onChange:g=>F(k=>({...k,[r.key]:g})),placeholder:r.placeholder,bgClass:r.bgClass,id:`${r.key}-color`},r.key))})})]}),e.jsxs("div",{children:[e.jsx(x,{className:"text-base font-semibold text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"🎨 Preset Colors"}),e.jsx("div",{className:"grid grid-cols-2 gap-4 mt-3",children:Ne.map((r,g)=>e.jsxs("button",{onClick:()=>se(r.colors),className:"p-4 rounded-[var(--radius-lg)] border-2 border-border bg-card",children:[e.jsxs("div",{className:"flex justify-center gap-2 mb-3",children:[e.jsx("div",{className:"w-6 h-6 rounded-full border-2 border-white shadow-[var(--shadow)]",style:{backgroundColor:r.colors.primary,boxShadow:`0 4px 16px ${r.colors.primary}40`}}),e.jsx("div",{className:"w-6 h-6 rounded-full border-2 border-white shadow-[var(--shadow)]",style:{backgroundColor:r.colors.secondary,boxShadow:`0 4px 16px ${r.colors.secondary}40`}}),e.jsx("div",{className:"w-6 h-6 rounded-full border-2 border-white shadow-[var(--shadow)]",style:{backgroundColor:r.colors.accent,boxShadow:`0 4px 16px ${r.colors.accent}40`}})]}),e.jsx("p",{className:"text-sm font-bold",style:{letterSpacing:"var(--tracking-normal)"},children:r.name})]},g))})]})]})]})}),e.jsx(B,{value:"typography",className:"mt-6",children:e.jsxs(C,{className:"border-0 shadow-[var(--shadow-lg)] bg-card",children:[e.jsxs($,{className:"rounded-t-[var(--radius-lg)]",children:[e.jsxs(P,{className:"flex items-center gap-2 text-lg text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:[e.jsx(Z,{className:"w-5 h-5 text-primary"}),"Typography"]}),e.jsx(T,{className:"text-muted-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"Configure fonts and text spacing"})]}),e.jsxs(z,{className:"space-y-6",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsx(x,{className:"text-base font-semibold text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"Font Family"}),e.jsxs(q,{value:m,onValueChange:H,children:[e.jsx(_,{className:"w-full bg-card border-2 border-border focus:border-primary rounded-[var(--radius)]",children:e.jsx(Q,{})}),e.jsx(W,{children:Se.map(r=>e.jsx(X,{value:r.value,children:e.jsx("span",{style:{fontFamily:r.value},children:r.label})},r.value))})]}),e.jsxs("div",{className:"p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border",children:[e.jsx("p",{style:{fontFamily:m,letterSpacing:"var(--tracking-normal)"},className:"text-2xl font-semibold text-foreground",children:"The quick brown fox jumps over the lazy dog"}),e.jsxs("p",{style:{fontFamily:m,letterSpacing:"var(--tracking-normal)"},className:"text-sm text-muted-foreground mt-2",children:["Preview of ",m," font family"]})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(x,{className:"text-base font-semibold text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"Letter Spacing"}),e.jsxs("span",{className:"text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]",style:{letterSpacing:"var(--tracking-normal)"},children:[N.toFixed(3),"em"]})]}),e.jsx(A,{value:[N],onValueChange:([r])=>V(r),min:-.05,max:.1,step:.005,className:"w-full"}),e.jsx("div",{className:"p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border",children:e.jsx("p",{style:{letterSpacing:`${N}em`,fontFamily:m},className:"text-lg text-foreground",children:"Adjusted letter spacing example text"})})]})]})]})}),e.jsx(B,{value:"spacing",className:"mt-6",children:e.jsxs(C,{className:"border-0 shadow-[var(--shadow-lg)] bg-card",children:[e.jsxs($,{className:"rounded-t-[var(--radius-lg)]",children:[e.jsxs(P,{className:"flex items-center gap-2 text-lg text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:[e.jsx(ee,{className:"w-5 h-5 text-primary"}),"Spacing System"]}),e.jsx(T,{className:"text-muted-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"Define your base spacing unit"})]}),e.jsx(z,{className:"space-y-6",children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(x,{className:"text-base font-semibold text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"Base Spacing Unit"}),e.jsxs("span",{className:"text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]",style:{letterSpacing:"var(--tracking-normal)"},children:[i,"px"]})]}),e.jsx(A,{value:[i],onValueChange:([r])=>O(r),min:2,max:16,step:1,className:"w-full"}),e.jsxs("div",{className:"p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border",children:[e.jsx(x,{className:"text-sm font-semibold text-foreground mb-3 block",style:{letterSpacing:"var(--tracking-normal)"},children:"Spacing Scale Preview"}),e.jsxs("div",{className:"flex items-end gap-2",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("div",{style:{width:i*1+"px",height:i*1+"px"},className:"bg-primary rounded mx-auto mb-1"}),e.jsx("span",{className:"text-xs font-mono text-muted-foreground",children:"1x"})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{style:{width:i*2+"px",height:i*2+"px"},className:"bg-primary rounded mx-auto mb-1"}),e.jsx("span",{className:"text-xs font-mono text-muted-foreground",children:"2x"})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{style:{width:i*4+"px",height:i*4+"px"},className:"bg-primary rounded mx-auto mb-1"}),e.jsx("span",{className:"text-xs font-mono text-muted-foreground",children:"4x"})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{style:{width:i*8+"px",height:i*8+"px"},className:"bg-primary rounded mx-auto mb-1"}),e.jsx("span",{className:"text-xs font-mono text-muted-foreground",children:"8x"})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{style:{width:i*12+"px",height:i*12+"px"},className:"bg-primary rounded mx-auto mb-1"}),e.jsx("span",{className:"text-xs font-mono text-muted-foreground",children:"12x"})]})]})]})]})})]})}),e.jsx(B,{value:"effects",className:"mt-6",children:e.jsxs(C,{className:"border-0 shadow-[var(--shadow-lg)] bg-card",children:[e.jsxs($,{className:"rounded-t-[var(--radius-lg)]",children:[e.jsxs(P,{className:"flex items-center gap-2 text-lg text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:[e.jsx(J,{className:"w-5 h-5 text-primary"}),"Effects & Borders"]}),e.jsx(T,{className:"text-muted-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"Configure shadows and border radius"})]}),e.jsxs(z,{className:"space-y-6",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(x,{className:"text-base font-semibold text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"Border Radius"}),e.jsxs("span",{className:"text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]",style:{letterSpacing:"var(--tracking-normal)"},children:[p,"px"]})]}),e.jsx(A,{value:[p],onValueChange:([r])=>E(r),min:0,max:24,step:1,className:"w-full"}),e.jsxs("div",{className:"p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border",children:[e.jsx(x,{className:"text-sm font-semibold text-foreground mb-3 block",style:{letterSpacing:"var(--tracking-normal)"},children:"Radius Scale Preview"}),e.jsxs("div",{className:"grid grid-cols-4 gap-3",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"h-16 bg-primary",style:{borderRadius:Math.max(0,p-4)+"px"},children:e.jsx("p",{className:"text-xs text-primary-foreground p-2 font-bold",style:{letterSpacing:"var(--tracking-normal)"},children:"SM"})}),e.jsxs("span",{className:"text-xs font-mono mt-1 block text-muted-foreground",children:[Math.max(0,p-4),"px"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"h-16 bg-primary",style:{borderRadius:Math.max(0,p-2)+"px"},children:e.jsx("p",{className:"text-xs text-primary-foreground p-2 font-bold",style:{letterSpacing:"var(--tracking-normal)"},children:"MD"})}),e.jsxs("span",{className:"text-xs font-mono mt-1 block text-muted-foreground",children:[Math.max(0,p-2),"px"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"h-16 bg-primary",style:{borderRadius:p+"px"},children:e.jsx("p",{className:"text-xs text-primary-foreground p-2 font-bold",style:{letterSpacing:"var(--tracking-normal)"},children:"LG"})}),e.jsxs("span",{className:"text-xs font-mono mt-1 block text-muted-foreground",children:[p,"px"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"h-16 bg-primary",style:{borderRadius:p+4+"px"},children:e.jsx("p",{className:"text-xs text-primary-foreground p-2 font-bold",style:{letterSpacing:"var(--tracking-normal)"},children:"XL"})}),e.jsxs("span",{className:"text-xs font-mono mt-1 block text-muted-foreground",children:[p+4,"px"]})]})]})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(x,{className:"text-base font-semibold text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"Shadow Style"}),e.jsxs(q,{value:R,onValueChange:G,children:[e.jsx(_,{className:"w-full bg-card border-2 border-border focus:border-primary rounded-[var(--radius)]",children:e.jsx(Q,{})}),e.jsx(W,{children:re.map(r=>e.jsx(X,{value:r.value,children:r.label},r.value))})]}),e.jsxs("div",{className:"p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border",children:[e.jsx(x,{className:"text-sm font-semibold text-foreground mb-3 block",style:{letterSpacing:"var(--tracking-normal)"},children:"Shadow Preview"}),e.jsx("div",{className:"grid grid-cols-3 gap-4",children:re.slice(0,3).map(r=>e.jsx("div",{className:"h-20 bg-card rounded-[var(--radius-lg)] flex items-center justify-center",style:{boxShadow:r.shadow},children:e.jsx("span",{className:"text-sm font-medium text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:r.label})},r.value))})]})]})]})]})})]})}),e.jsx("div",{className:"lg:sticky lg:top-6",children:e.jsxs(C,{className:"h-fit border-0 shadow-[var(--shadow-2xl)] bg-card overflow-hidden",children:[e.jsxs($,{children:[e.jsxs(P,{className:"flex items-center gap-2 text-lg text-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:[e.jsx(ve,{className:"w-5 h-5 text-primary"}),"Live Preview"]}),e.jsx(T,{className:"text-muted-foreground",style:{letterSpacing:"var(--tracking-normal)"},children:"See how your changes look in real-time"})]}),e.jsx(z,{className:"p-0 h-[800px]",children:e.jsx("div",{className:"h-full w-full",children:e.jsx(be,{projectId:l,colors:w,designSystem:{colors:w,fontFamily:m,letterTracking:N,borderRadius:p,spacing:i,shadowStyle:R},className:"h-full w-full"})})})]})})]})]})})}function Ye(){return e.jsx(Fe,{})}export{Ye as component};
