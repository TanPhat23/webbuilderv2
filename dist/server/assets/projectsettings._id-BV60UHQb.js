import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./card-LOcGasZb.js";
import { O as Label, I as Input, ac as useProjectStore, p as projectService, B as Button, T as Tabs, g as TabsList, h as TabsTrigger, i as TabsContent } from "./prisma-Cq49YOYM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import { S as Slider } from "./slider-Cs09bDyX.js";
import { ArrowLeft, Save, Palette, Type, Move, Layers, Eye } from "lucide-react";
import "sonner";
import "clsx";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "react-hook-form";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
function ProjectPreview({
  projectId,
  className = "",
  colors,
  designSystem
}) {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const generateShadowVars2 = (style) => {
    const shadows = {
      sm: `--shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
      --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);`,
      md: `--shadow: 0px 2px 4px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
      --shadow-md: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);`,
      lg: `--shadow-lg: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);
      --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);`,
      xl: `--shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
      --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,
      "2xl": `--shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`
    };
    return shadows[style] || shadows.md;
  };
  const generateDesignSystemCSS2 = (system) => {
    const colorScheme = system.colors || colors || { primary: "#3b82f6", secondary: "#e0e7ff", accent: "#1e40af" };
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
        ${generateShadowVars2(shadowStyle)}
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
  const generatePreviewHTML = (system) => {
    const colorScheme = system.colors || colors || { primary: "#3b82f6", secondary: "#e0e7ff", accent: "#1e40af" };
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

    ${generateDesignSystemCSS2(system)}

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
        <p>Font family ${fontFamily} with ${letterTracking === 0 ? "default" : letterTracking.toFixed(3) + "em"} letter spacing ensures optimal readability and a consistent typographic rhythm across all content.</p>
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
          <p>Large, bold typography for primary headings and hero sections. Uses ${fontFamily} with ${letterTracking === 0 ? "default" : letterTracking.toFixed(3) + "em"} letter spacing.</p>
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
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `relative ${className} rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200`,
      children: [
        isLoading && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center space-y-3", children: [
          /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-700", children: "Loading preview..." })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full", children: [
          /* @__PURE__ */ jsx(
            "iframe",
            {
              ref: iframeRef,
              className: "w-full h-full border-0 bg-white",
              title: "Website Preview",
              onLoad: handleIframeLoad,
              sandbox: "allow-same-origin allow-scripts"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute top-3 right-3 flex flex-col gap-2 z-20", children: (colors || designSystem) && /* @__PURE__ */ jsxs("div", { className: "bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 p-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-gray-700", children: "Live Preview" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 mb-2", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-6 h-6 rounded-md border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer",
                  style: {
                    backgroundColor: colors?.primary || designSystem?.colors?.primary
                  },
                  title: "Primary Color"
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-6 h-6 rounded-md border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer",
                  style: {
                    backgroundColor: colors?.secondary || designSystem?.colors?.secondary
                  },
                  title: "Secondary Color"
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-6 h-6 rounded-md border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer",
                  style: {
                    backgroundColor: colors?.accent || designSystem?.colors?.accent
                  },
                  title: "Accent Color"
                }
              )
            ] }),
            (designSystem?.fontFamily || designSystem?.letterTracking !== void 0) && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-600 space-y-1 border-t pt-2", children: [
              designSystem.fontFamily && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Font:" }),
                /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded", children: designSystem.fontFamily })
              ] }),
              designSystem.letterTracking !== void 0 && designSystem.letterTracking !== 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Tracking:" }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded", children: [
                  designSystem.letterTracking.toFixed(3),
                  "em"
                ] })
              ] })
            ] }),
            (designSystem?.spacing || designSystem?.borderRadius) && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-600 space-y-1 border-t pt-2 mt-2", children: [
              designSystem.spacing && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Spacing:" }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded", children: [
                  designSystem.spacing,
                  "px"
                ] })
              ] }),
              designSystem.borderRadius !== void 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Radius:" }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded", children: [
                  designSystem.borderRadius,
                  "px"
                ] })
              ] })
            ] }),
            designSystem?.shadowStyle && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-600 border-t pt-2 mt-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Shadow:" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded uppercase", children: designSystem.shadowStyle })
            ] }) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 z-10", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-white text-xs", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-green-400" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Ready" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "bg-black/30 backdrop-blur-sm px-2 py-1 rounded font-mono", children: "Preview Mode" })
          ] }) })
        ] })
      ]
    }
  );
}
function ColorInput({
  label,
  value,
  onChange,
  placeholder,
  bgClass = "",
  id
}) {
  return /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
    /* @__PURE__ */ jsxs(
      Label,
      {
        className: "text-sm font-bold text-foreground flex items-center justify-center gap-2",
        style: {
          letterSpacing: "var(--tracking-normal)"
        },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `w-3 h-3 rounded-full ${bgClass}`,
              style: !bgClass ? {
                backgroundColor: value
              } : {}
            }
          ),
          label
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "relative mx-auto w-fit", children: /* @__PURE__ */ jsx(
      "input",
      {
        type: "color",
        id,
        value,
        onChange: (e) => onChange(e.target.value),
        className: "w-16 h-16 rounded-[var(--radius-lg)] border-2 border-border shadow-[var(--shadow-md)] cursor-pointer mx-auto"
      }
    ) }),
    /* @__PURE__ */ jsx(
      Input,
      {
        value,
        onChange: (e) => onChange(e.target.value),
        className: "font-mono text-xs border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-[var(--radius)] bg-card text-center",
        style: {
          letterSpacing: "var(--tracking-normal)"
        },
        placeholder
      }
    )
  ] });
}
function generateShadowVars(style) {
  const shadows = {
    sm: `  --shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.05);
  --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);`,
    md: `  --shadow: 0px 2px 4px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow-md: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);`,
    lg: `  --shadow-lg: 0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1);
  --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);`,
    xl: `  --shadow-xl: 0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`,
    "2xl": `  --shadow-2xl: 0px 25px 50px -12px hsl(0 0% 0% / 0.25);`
  };
  return shadows[style] || shadows.md;
}
function generateDesignSystemCSS(system) {
  const colorScheme = system.colors || {
    primary: "#3b82f6",
    secondary: "#e0e7ff",
    accent: "#1e40af"
  };
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
}
function generateColorsCSS(colors) {
  return `
:root {
  /* Primary Colors */
  --color-primary: ${colors.primary};
  --primary: ${colors.primary};
  --primary-foreground: ${colors.primaryForeground};

  /* Secondary Colors */
  --color-secondary: ${colors.secondary};
  --secondary: ${colors.secondary};
  --secondary-foreground: ${colors.secondaryForeground};

  /* Accent Colors */
  --color-accent: ${colors.accent};
  --accent: ${colors.accent};
  --accent-foreground: ${colors.accentForeground};

  /* Background Colors */
  --background: ${colors.background};
  --foreground: ${colors.foreground};

  /* Card Colors */
  --card: ${colors.card};
  --card-foreground: ${colors.cardForeground};

  /* Muted Colors */
  --muted: ${colors.muted};
  --muted-foreground: ${colors.mutedForeground};

  /* Border */
  --border: ${colors.border};

  /* Destructive Colors */
  --destructive: ${colors.destructive};
  --destructive-foreground: ${colors.destructiveForeground};
}

/* Utility Classes */
.bg-primary {
  background-color: ${colors.primary} !important;
}

.text-primary {
  color: ${colors.primary} !important;
}

.text-primary-foreground {
  color: ${colors.primaryForeground} !important;
}

.bg-secondary {
  background-color: ${colors.secondary} !important;
}

.text-secondary-foreground {
  color: ${colors.secondaryForeground} !important;
}

.bg-accent {
  background-color: ${colors.accent} !important;
}

.text-accent-foreground {
  color: ${colors.accentForeground} !important;
}

.bg-card {
  background-color: ${colors.card} !important;
}

.text-card-foreground {
  color: ${colors.cardForeground} !important;
}

.bg-muted {
  background-color: ${colors.muted} !important;
}

.text-muted-foreground {
  color: ${colors.mutedForeground} !important;
}

.border-primary {
  border-color: ${colors.primary} !important;
}

.border-border {
  border-color: ${colors.border} !important;
}

.bg-destructive {
  background-color: ${colors.destructive} !important;
}

.text-destructive-foreground {
  color: ${colors.destructiveForeground} !important;
}

/* Hover States */
.hover\\:bg-primary\\/90:hover {
  background-color: ${colors.primary}e6 !important;
}

.hover\\:bg-secondary\\/90:hover {
  background-color: ${colors.secondary}e6 !important;
}

.hover\\:bg-accent\\/90:hover {
  background-color: ${colors.accent}e6 !important;
}
`;
}
const PRESET_COLORS = [
  {
    name: "Blue Ocean",
    colors: {
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      secondary: "#e0e7ff",
      secondaryForeground: "#1e3a8a",
      accent: "#1e40af",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#f8fafc",
      cardForeground: "#0f172a",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      border: "#e2e8f0",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff"
    }
  },
  {
    name: "Green Forest",
    colors: {
      primary: "#10b981",
      primaryForeground: "#ffffff",
      secondary: "#d1fae5",
      secondaryForeground: "#065f46",
      accent: "#047857",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#f0fdf4",
      cardForeground: "#0f172a",
      muted: "#dcfce7",
      mutedForeground: "#166534",
      border: "#bbf7d0",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff"
    }
  },
  {
    name: "Purple Magic",
    colors: {
      primary: "#8b5cf6",
      primaryForeground: "#ffffff",
      secondary: "#ede9fe",
      secondaryForeground: "#5b21b6",
      accent: "#5b21b6",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#faf5ff",
      cardForeground: "#0f172a",
      muted: "#f3e8ff",
      mutedForeground: "#7c3aed",
      border: "#e9d5ff",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff"
    }
  },
  {
    name: "Orange Sunset",
    colors: {
      primary: "#f59e0b",
      primaryForeground: "#ffffff",
      secondary: "#fef3c7",
      secondaryForeground: "#92400e",
      accent: "#d97706",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#fffbeb",
      cardForeground: "#0f172a",
      muted: "#fef3c7",
      mutedForeground: "#b45309",
      border: "#fde68a",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff"
    }
  },
  {
    name: "Red Passion",
    colors: {
      primary: "#ef4444",
      primaryForeground: "#ffffff",
      secondary: "#fee2e2",
      secondaryForeground: "#991b1b",
      accent: "#dc2626",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#fef2f2",
      cardForeground: "#0f172a",
      muted: "#fecaca",
      mutedForeground: "#b91c1c",
      border: "#fca5a5",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff"
    }
  },
  {
    name: "Pink Rose",
    colors: {
      primary: "#ec4899",
      primaryForeground: "#ffffff",
      secondary: "#fce7f3",
      secondaryForeground: "#9f1239",
      accent: "#be185d",
      accentForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#0f172a",
      card: "#fdf2f8",
      cardForeground: "#0f172a",
      muted: "#fbcfe8",
      mutedForeground: "#db2777",
      border: "#f9a8d4",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff"
    }
  }
];
const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Sans)" },
  { value: "Lora", label: "Lora (Serif)" },
  { value: "JetBrains Mono", label: "JetBrains Mono (Mono)" }
];
const SHADOW_OPTIONS = [
  {
    value: "sm",
    label: "Small",
    shadow: "0px 1px 2px 0px hsl(0 0% 0% / 0.05)"
  },
  {
    value: "md",
    label: "Medium",
    shadow: "0px 2px 4px 0px hsl(0 0% 0% / 0.1), 0px 1px 2px -1px hsl(0 0% 0% / 0.1)"
  },
  {
    value: "lg",
    label: "Large",
    shadow: "0px 4px 6px -1px hsl(0 0% 0% / 0.1), 0px 2px 4px -2px hsl(0 0% 0% / 0.1)"
  },
  {
    value: "xl",
    label: "Extra Large",
    shadow: "0px 10px 15px -3px hsl(0 0% 0% / 0.1), 0px 4px 6px -4px hsl(0 0% 0% / 0.1)"
  },
  {
    value: "2xl",
    label: "2X Large",
    shadow: "0px 25px 50px -12px hsl(0 0% 0% / 0.25)"
  }
];
function ProjectSettings() {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { updateProject } = useProjectStore();
  const projectId = params.id;
  const [customCSS, setCustomCSS] = useState("");
  const [selectedColors, setSelectedColors] = useState({
    primary: "#3b82f6",
    primaryForeground: "#ffffff",
    secondary: "#e0e7ff",
    secondaryForeground: "#1e3a8a",
    accent: "#1e40af",
    accentForeground: "#ffffff",
    background: "#ffffff",
    foreground: "#0f172a",
    card: "#f8fafc",
    cardForeground: "#0f172a",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff"
  });
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [letterTracking, setLetterTracking] = useState(0);
  const [borderRadius, setBorderRadius] = useState(8);
  const [spacing, setSpacing] = useState(4);
  const [shadowStyle, setShadowStyle] = useState("md");
  const colorFields = [
    {
      key: "primary",
      label: "Primary",
      bgClass: "bg-primary",
      placeholder: "#3b82f6"
    },
    {
      key: "primaryForeground",
      label: "Primary FG",
      bgClass: "",
      placeholder: "#ffffff"
    },
    {
      key: "secondary",
      label: "Secondary",
      bgClass: "bg-secondary",
      placeholder: "#e0e7ff"
    },
    {
      key: "secondaryForeground",
      label: "Secondary FG",
      bgClass: "",
      placeholder: "#1e3a8a"
    },
    {
      key: "accent",
      label: "Accent",
      bgClass: "bg-accent",
      placeholder: "#1e40af"
    },
    {
      key: "accentForeground",
      label: "Accent FG",
      bgClass: "",
      placeholder: "#ffffff"
    },
    {
      key: "background",
      label: "Background",
      bgClass: "",
      placeholder: "#ffffff"
    },
    {
      key: "foreground",
      label: "Foreground",
      bgClass: "",
      placeholder: "#0f172a"
    },
    { key: "card", label: "Card", bgClass: "", placeholder: "#f8fafc" },
    {
      key: "cardForeground",
      label: "Card FG",
      bgClass: "",
      placeholder: "#0f172a"
    },
    { key: "muted", label: "Muted", bgClass: "", placeholder: "#f1f5f9" },
    {
      key: "mutedForeground",
      label: "Muted FG",
      bgClass: "",
      placeholder: "#64748b"
    },
    { key: "border", label: "Border", bgClass: "", placeholder: "#e2e8f0" },
    {
      key: "destructive",
      label: "Destructive",
      bgClass: "",
      placeholder: "#ef4444"
    },
    {
      key: "destructiveForeground",
      label: "Destructive FG",
      bgClass: "",
      placeholder: "#ffffff"
    }
  ];
  const {
    data: project,
    error,
    isLoading
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: !!projectId
  });
  const updateProjectMutation = useMutation({
    mutationFn: (updatedProject) => {
      const { id, createdAt, updatedAt, deletedAt, ownerId, ...body } = updatedProject;
      return projectService.updateProjectPartial(id, body);
    },
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(["project", projectId], updatedProject);
      updateProject(updatedProject);
      console.log("Project updated successfully!");
    },
    onError: (error2) => {
      let message = "Failed to update project";
      try {
        if (error2 && typeof error2 === "object" && error2.message) {
          message = String(error2.message);
          const jsonMatch = message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            message = parsed.errorMessage || parsed.message || JSON.stringify(parsed);
          }
        }
      } catch {
      }
      console.error("Update error:", error2);
      console.error("Server message:", message);
      alert(`Update failed: ${message}`);
    }
  });
  useEffect(() => {
    if (project) {
      setProjectName(project.name || "");
      setProjectDescription(project.description || "");
      setIsPublished(project.published || false);
      setSubdomain(project.subdomain || "");
      if (project.header?.cssStyles) {
        setCustomCSS(project.header.cssStyles || "");
      }
      if (project.styles && typeof project.styles === "object") {
        const styles = project.styles;
        setSelectedColors({
          primary: styles.primary || "#3b82f6",
          primaryForeground: styles.primaryForeground || "#ffffff",
          secondary: styles.secondary || "#e0e7ff",
          secondaryForeground: styles.secondaryForeground || "#1e3a8a",
          accent: styles.accent || "#1e40af",
          accentForeground: styles.accentForeground || "#ffffff",
          background: styles.background || "#ffffff",
          foreground: styles.foreground || "#0f172a",
          card: styles.card || "#f8fafc",
          cardForeground: styles.cardForeground || "#0f172a",
          muted: styles.muted || "#f1f5f9",
          mutedForeground: styles.mutedForeground || "#64748b",
          border: styles.border || "#e2e8f0",
          destructive: styles.destructive || "#ef4444",
          destructiveForeground: styles.destructiveForeground || "#ffffff"
        });
        setFontFamily(styles.fontFamily || "Inter");
        setLetterTracking(styles.letterTracking || 0);
        setBorderRadius(styles.borderRadius || 8);
        setSpacing(styles.spacing || 4);
        setShadowStyle(styles.shadowStyle || "md");
      }
    }
  }, [project]);
  const handleColorPresetSelect = (colors) => {
    setSelectedColors(colors);
  };
  const handleSave = () => {
    const colorCSS = generateColorsCSS(selectedColors);
    const designSystemCSS = generateDesignSystemCSS({
      fontFamily,
      letterTracking,
      borderRadius,
      spacing,
      shadowStyle
    });
    const combinedCSS = customCSS + "\n\n/* Auto-generated Design System */\n" + designSystemCSS + "\n\n/* Auto-generated Color Scheme */\n" + colorCSS;
    const updatedProject = {
      id: projectId,
      name: projectName,
      description: projectDescription,
      published: isPublished,
      subdomain,
      header: {
        ...project?.header,
        cssStyles: combinedCSS
      },
      styles: {
        ...selectedColors,
        fontFamily,
        borderRadius,
        spacing,
        letterTracking,
        shadowStyle
      }
    };
    updateProjectMutation.mutate(updatedProject);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "h-screen flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background p-6 w-full", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8 p-6 bg-card rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-border", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => navigate({ to: "/dashboard" }),
            className: "flex items-center gap-2 rounded-[var(--radius)]",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
              "Back"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            "h1",
            {
              className: "text-3xl font-bold text-primary",
              style: { letterSpacing: "var(--tracking-normal)" },
              children: "Project Settings"
            }
          ),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "text-muted-foreground text-lg",
              style: { letterSpacing: "var(--tracking-normal)" },
              children: "Customize your project appearance and styles"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: handleSave,
          disabled: updateProjectMutation.isPending,
          className: "flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-[var(--radius-lg)] shadow-[var(--shadow)]",
          children: [
            /* @__PURE__ */ jsx(Save, { className: "w-5 h-5" }),
            updateProjectMutation.isPending ? "Saving..." : "Save Changes"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs(Tabs, { defaultValue: "colors", className: "w-full", children: [
        /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-4 bg-card shadow-[var(--shadow)] rounded-[var(--radius-lg)] p-1 border border-border", children: [
          /* @__PURE__ */ jsxs(
            TabsTrigger,
            {
              value: "colors",
              className: "flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]",
              style: { letterSpacing: "var(--tracking-normal)" },
              children: [
                /* @__PURE__ */ jsx(Palette, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Colors" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            TabsTrigger,
            {
              value: "typography",
              className: "flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]",
              style: { letterSpacing: "var(--tracking-normal)" },
              children: [
                /* @__PURE__ */ jsx(Type, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Typography" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            TabsTrigger,
            {
              value: "spacing",
              className: "flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]",
              style: { letterSpacing: "var(--tracking-normal)" },
              children: [
                /* @__PURE__ */ jsx(Move, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Spacing" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            TabsTrigger,
            {
              value: "effects",
              className: "flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-[var(--radius)]",
              style: { letterSpacing: "var(--tracking-normal)" },
              children: [
                /* @__PURE__ */ jsx(Layers, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Effects" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "colors", className: "mt-6", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-[var(--shadow-lg)] bg-card", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "rounded-t-[var(--radius-lg)]", children: [
            /* @__PURE__ */ jsxs(
              CardTitle,
              {
                className: "flex items-center gap-2 text-lg text-foreground",
                style: { letterSpacing: "var(--tracking-normal)" },
                children: [
                  /* @__PURE__ */ jsx(Palette, { className: "w-5 h-5 text-primary" }),
                  "Color Scheme"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              CardDescription,
              {
                className: "text-muted-foreground",
                style: { letterSpacing: "var(--tracking-normal)" },
                children: "Choose colors for your project theme"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx(
                Label,
                {
                  className: "text-base font-semibold text-foreground",
                  style: { letterSpacing: "var(--tracking-normal)" },
                  children: "Custom Colors"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "p-6 rounded-[var(--radius-lg)] border-2 border-border bg-muted/50", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", children: colorFields.map((field) => /* @__PURE__ */ jsx(
                ColorInput,
                {
                  label: field.label,
                  value: selectedColors[field.key],
                  onChange: (value) => setSelectedColors((prev) => ({
                    ...prev,
                    [field.key]: value
                  })),
                  placeholder: field.placeholder,
                  bgClass: field.bgClass,
                  id: `${field.key}-color`
                },
                field.key
              )) }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(
                Label,
                {
                  className: "text-base font-semibold text-foreground",
                  style: { letterSpacing: "var(--tracking-normal)" },
                  children: "🎨 Preset Colors"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 mt-3", children: PRESET_COLORS.map((preset, index) => /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleColorPresetSelect(preset.colors),
                  className: "p-4 rounded-[var(--radius-lg)] border-2 border-border bg-card",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-2 mb-3", children: [
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "w-6 h-6 rounded-full border-2 border-white shadow-[var(--shadow)]",
                          style: {
                            backgroundColor: preset.colors.primary,
                            boxShadow: `0 4px 16px ${preset.colors.primary}40`
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "w-6 h-6 rounded-full border-2 border-white shadow-[var(--shadow)]",
                          style: {
                            backgroundColor: preset.colors.secondary,
                            boxShadow: `0 4px 16px ${preset.colors.secondary}40`
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "w-6 h-6 rounded-full border-2 border-white shadow-[var(--shadow)]",
                          style: {
                            backgroundColor: preset.colors.accent,
                            boxShadow: `0 4px 16px ${preset.colors.accent}40`
                          }
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx(
                      "p",
                      {
                        className: "text-sm font-bold",
                        style: {
                          letterSpacing: "var(--tracking-normal)"
                        },
                        children: preset.name
                      }
                    )
                  ]
                },
                index
              )) })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "typography", className: "mt-6", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-[var(--shadow-lg)] bg-card", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "rounded-t-[var(--radius-lg)]", children: [
            /* @__PURE__ */ jsxs(
              CardTitle,
              {
                className: "flex items-center gap-2 text-lg text-foreground",
                style: { letterSpacing: "var(--tracking-normal)" },
                children: [
                  /* @__PURE__ */ jsx(Type, { className: "w-5 h-5 text-primary" }),
                  "Typography"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              CardDescription,
              {
                className: "text-muted-foreground",
                style: { letterSpacing: "var(--tracking-normal)" },
                children: "Configure fonts and text spacing"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(
                Label,
                {
                  className: "text-base font-semibold text-foreground",
                  style: { letterSpacing: "var(--tracking-normal)" },
                  children: "Font Family"
                }
              ),
              /* @__PURE__ */ jsxs(Select, { value: fontFamily, onValueChange: setFontFamily, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full bg-card border-2 border-border focus:border-primary rounded-[var(--radius)]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsx(SelectContent, { children: FONT_OPTIONS.map((font) => /* @__PURE__ */ jsx(SelectItem, { value: font.value, children: /* @__PURE__ */ jsx("span", { style: { fontFamily: font.value }, children: font.label }) }, font.value)) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border", children: [
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    style: {
                      fontFamily,
                      letterSpacing: "var(--tracking-normal)"
                    },
                    className: "text-2xl font-semibold text-foreground",
                    children: "The quick brown fox jumps over the lazy dog"
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "p",
                  {
                    style: {
                      fontFamily,
                      letterSpacing: "var(--tracking-normal)"
                    },
                    className: "text-sm text-muted-foreground mt-2",
                    children: [
                      "Preview of ",
                      fontFamily,
                      " font family"
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx(
                  Label,
                  {
                    className: "text-base font-semibold text-foreground",
                    style: { letterSpacing: "var(--tracking-normal)" },
                    children: "Letter Spacing"
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: "text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]",
                    style: { letterSpacing: "var(--tracking-normal)" },
                    children: [
                      letterTracking.toFixed(3),
                      "em"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                Slider,
                {
                  value: [letterTracking],
                  onValueChange: ([val]) => setLetterTracking(val),
                  min: -0.05,
                  max: 0.1,
                  step: 5e-3,
                  className: "w-full"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border", children: /* @__PURE__ */ jsx(
                "p",
                {
                  style: {
                    letterSpacing: `${letterTracking}em`,
                    fontFamily
                  },
                  className: "text-lg text-foreground",
                  children: "Adjusted letter spacing example text"
                }
              ) })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "spacing", className: "mt-6", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-[var(--shadow-lg)] bg-card", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "rounded-t-[var(--radius-lg)]", children: [
            /* @__PURE__ */ jsxs(
              CardTitle,
              {
                className: "flex items-center gap-2 text-lg text-foreground",
                style: { letterSpacing: "var(--tracking-normal)" },
                children: [
                  /* @__PURE__ */ jsx(Move, { className: "w-5 h-5 text-primary" }),
                  "Spacing System"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              CardDescription,
              {
                className: "text-muted-foreground",
                style: { letterSpacing: "var(--tracking-normal)" },
                children: "Define your base spacing unit"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(
                Label,
                {
                  className: "text-base font-semibold text-foreground",
                  style: { letterSpacing: "var(--tracking-normal)" },
                  children: "Base Spacing Unit"
                }
              ),
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: "text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]",
                  style: { letterSpacing: "var(--tracking-normal)" },
                  children: [
                    spacing,
                    "px"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              Slider,
              {
                value: [spacing],
                onValueChange: ([val]) => setSpacing(val),
                min: 2,
                max: 16,
                step: 1,
                className: "w-full"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border", children: [
              /* @__PURE__ */ jsx(
                Label,
                {
                  className: "text-sm font-semibold text-foreground mb-3 block",
                  style: { letterSpacing: "var(--tracking-normal)" },
                  children: "Spacing Scale Preview"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        width: spacing * 1 + "px",
                        height: spacing * 1 + "px"
                      },
                      className: "bg-primary rounded mx-auto mb-1"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-muted-foreground", children: "1x" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        width: spacing * 2 + "px",
                        height: spacing * 2 + "px"
                      },
                      className: "bg-primary rounded mx-auto mb-1"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-muted-foreground", children: "2x" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        width: spacing * 4 + "px",
                        height: spacing * 4 + "px"
                      },
                      className: "bg-primary rounded mx-auto mb-1"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-muted-foreground", children: "4x" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        width: spacing * 8 + "px",
                        height: spacing * 8 + "px"
                      },
                      className: "bg-primary rounded mx-auto mb-1"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-muted-foreground", children: "8x" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        width: spacing * 12 + "px",
                        height: spacing * 12 + "px"
                      },
                      className: "bg-primary rounded mx-auto mb-1"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-mono text-muted-foreground", children: "12x" })
                ] })
              ] })
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "effects", className: "mt-6", children: /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-[var(--shadow-lg)] bg-card", children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "rounded-t-[var(--radius-lg)]", children: [
            /* @__PURE__ */ jsxs(
              CardTitle,
              {
                className: "flex items-center gap-2 text-lg text-foreground",
                style: { letterSpacing: "var(--tracking-normal)" },
                children: [
                  /* @__PURE__ */ jsx(Layers, { className: "w-5 h-5 text-primary" }),
                  "Effects & Borders"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              CardDescription,
              {
                className: "text-muted-foreground",
                style: { letterSpacing: "var(--tracking-normal)" },
                children: "Configure shadows and border radius"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx(
                  Label,
                  {
                    className: "text-base font-semibold text-foreground",
                    style: { letterSpacing: "var(--tracking-normal)" },
                    children: "Border Radius"
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: "text-sm font-mono bg-muted px-3 py-1 rounded-[var(--radius)]",
                    style: { letterSpacing: "var(--tracking-normal)" },
                    children: [
                      borderRadius,
                      "px"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                Slider,
                {
                  value: [borderRadius],
                  onValueChange: ([val]) => setBorderRadius(val),
                  min: 0,
                  max: 24,
                  step: 1,
                  className: "w-full"
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border", children: [
                /* @__PURE__ */ jsx(
                  Label,
                  {
                    className: "text-sm font-semibold text-foreground mb-3 block",
                    style: { letterSpacing: "var(--tracking-normal)" },
                    children: "Radius Scale Preview"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "h-16 bg-primary",
                        style: {
                          borderRadius: Math.max(0, borderRadius - 4) + "px"
                        },
                        children: /* @__PURE__ */ jsx(
                          "p",
                          {
                            className: "text-xs text-primary-foreground p-2 font-bold",
                            style: {
                              letterSpacing: "var(--tracking-normal)"
                            },
                            children: "SM"
                          }
                        )
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs font-mono mt-1 block text-muted-foreground", children: [
                      Math.max(0, borderRadius - 4),
                      "px"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "h-16 bg-primary",
                        style: {
                          borderRadius: Math.max(0, borderRadius - 2) + "px"
                        },
                        children: /* @__PURE__ */ jsx(
                          "p",
                          {
                            className: "text-xs text-primary-foreground p-2 font-bold",
                            style: {
                              letterSpacing: "var(--tracking-normal)"
                            },
                            children: "MD"
                          }
                        )
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs font-mono mt-1 block text-muted-foreground", children: [
                      Math.max(0, borderRadius - 2),
                      "px"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "h-16 bg-primary",
                        style: { borderRadius: borderRadius + "px" },
                        children: /* @__PURE__ */ jsx(
                          "p",
                          {
                            className: "text-xs text-primary-foreground p-2 font-bold",
                            style: {
                              letterSpacing: "var(--tracking-normal)"
                            },
                            children: "LG"
                          }
                        )
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs font-mono mt-1 block text-muted-foreground", children: [
                      borderRadius,
                      "px"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "h-16 bg-primary",
                        style: { borderRadius: borderRadius + 4 + "px" },
                        children: /* @__PURE__ */ jsx(
                          "p",
                          {
                            className: "text-xs text-primary-foreground p-2 font-bold",
                            style: {
                              letterSpacing: "var(--tracking-normal)"
                            },
                            children: "XL"
                          }
                        )
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs font-mono mt-1 block text-muted-foreground", children: [
                      borderRadius + 4,
                      "px"
                    ] })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(
                Label,
                {
                  className: "text-base font-semibold text-foreground",
                  style: { letterSpacing: "var(--tracking-normal)" },
                  children: "Shadow Style"
                }
              ),
              /* @__PURE__ */ jsxs(
                Select,
                {
                  value: shadowStyle,
                  onValueChange: setShadowStyle,
                  children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full bg-card border-2 border-border focus:border-primary rounded-[var(--radius)]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsx(SelectContent, { children: SHADOW_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-[var(--radius-lg)] bg-muted/50 border-2 border-border", children: [
                /* @__PURE__ */ jsx(
                  Label,
                  {
                    className: "text-sm font-semibold text-foreground mb-3 block",
                    style: { letterSpacing: "var(--tracking-normal)" },
                    children: "Shadow Preview"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-4", children: SHADOW_OPTIONS.slice(0, 3).map((opt) => /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-20 bg-card rounded-[var(--radius-lg)] flex items-center justify-center",
                    style: { boxShadow: opt.shadow },
                    children: /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "text-sm font-medium text-foreground",
                        style: {
                          letterSpacing: "var(--tracking-normal)"
                        },
                        children: opt.label
                      }
                    )
                  },
                  opt.value
                )) })
              ] })
            ] })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "lg:sticky lg:top-6", children: /* @__PURE__ */ jsxs(Card, { className: "h-fit border-0 shadow-[var(--shadow-2xl)] bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(
            CardTitle,
            {
              className: "flex items-center gap-2 text-lg text-foreground",
              style: { letterSpacing: "var(--tracking-normal)" },
              children: [
                /* @__PURE__ */ jsx(Eye, { className: "w-5 h-5 text-primary" }),
                "Live Preview"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            CardDescription,
            {
              className: "text-muted-foreground",
              style: { letterSpacing: "var(--tracking-normal)" },
              children: "See how your changes look in real-time"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-0 h-[800px]", children: /* @__PURE__ */ jsx("div", { className: "h-full w-full", children: /* @__PURE__ */ jsx(
          ProjectPreview,
          {
            projectId,
            colors: selectedColors,
            designSystem: {
              colors: selectedColors,
              fontFamily,
              letterTracking,
              borderRadius,
              spacing,
              shadowStyle
            },
            className: "h-full w-full"
          }
        ) }) })
      ] }) })
    ] })
  ] }) });
}
function ProjectSettingsPage() {
  return /* @__PURE__ */ jsx(ProjectSettings, {});
}
export {
  ProjectSettingsPage as component
};
