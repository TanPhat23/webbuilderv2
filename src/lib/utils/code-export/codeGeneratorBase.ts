import { EditorElement, ContainerElement } from "@/types/global.type";
import { CSSStyles, ResponsiveStyles } from "@/interfaces/elements.interface";
import { isContainerElement } from "@/lib/utils/element/elementhelper";
import { Page } from "@/interfaces/page.interface";
import JSZip from "jszip";

export interface CodeGenerationOptions {
  includeTailwind?: boolean;
  responsiveBreakpoints?: boolean;
  minify?: boolean;
  exportFormat?: "html" | "react" | "vue" | "angular";
  page?: Page;
}

export interface GeneratedCode {
  html: string;
  css: string;
  js: string;
  fullPage: string;
  reactApp?: string;
  reactComponents?: Record<string, string>;
  reactIndex?: string;
  packageJson?: string;
  zipBlob?: Blob;
}

export abstract class BaseCodeGenerator {
  protected cssClasses: Map<string, string> = new Map();
  protected classCounter = 0;
  protected options: CodeGenerationOptions;

  constructor(options: CodeGenerationOptions = {}) {
    this.options = {
      includeTailwind: false,
      responsiveBreakpoints: true,
      minify: false,
      exportFormat: "html",
      ...options,
    };
  }

  abstract generateCode(elements: EditorElement[]): Promise<GeneratedCode>;

  protected generateHTML(elements: EditorElement[], indent = 2): string {
    return elements
      .map((el) => this.generateElementHTML(el, indent))
      .join("\n");
  }

  protected generateElementHTML(element: EditorElement, indent = 2): string {
    const className = this.getOrCreateClass(element);
    const indentStr = " ".repeat(indent);
    let tag = "div";
    let content = element.content || "";
    let attributes = `class="${className}"`;
    let isSelfClosing = false;

    switch (element.type) {
      case "Text":
        tag = "p";
        break;
      case "Button":
        tag = "button";
        break;
      case "Input":
        tag = "input";
        isSelfClosing = true;
        attributes += ` type="${(element.settings as any)?.type || "text"}" placeholder="${(element.settings as any)?.placeholder || ""}" name="${(element.settings as any)?.name || ""}"`;
        break;
      case "Image":
        tag = "img";
        isSelfClosing = true;
        attributes += ` src="${element.src || ""}" alt="${(element as any).alt || ""}"`;
        break;
      case "Form":
        tag = "form";
        attributes += ` action="${(element.settings as any)?.action || ""}" method="${(element.settings as any)?.method || "post"}"`;
        break;
      case "CMSContentList":
        tag = "div";
        attributes += ` data-cms-type="${(element.settings as any)?.contentTypeId}" data-limit="${(element.settings as any)?.limit || 10}"`;
        content = "<!-- CMS Content List -->";
        break;
      case "CMSContentItem":
        tag = "div";
        attributes += ` data-cms-type="${(element.settings as any)?.contentTypeId}" data-slug="${(element.settings as any)?.itemSlug}"`;
        content = "<!-- CMS Content Item -->";
        break;
      case "CMSContentGrid":
        tag = "div";
        attributes += ` data-cms-type="${(element.settings as any)?.contentTypeId}" data-limit="${(element.settings as any)?.limit || 12}"`;
        content = "<!-- CMS Content Grid -->";
        break;
      default:
        break;
    }

    if (isSelfClosing) {
      return `${indentStr}<${tag} ${attributes} />`;
    }

    if (isContainerElement(element)) {
      const container = element as ContainerElement;
      const children =
        (container as any).elements
          ?.map((child: EditorElement) =>
            this.generateElementHTML(child, indent + 2),
          )
          .join("\n") || "";
      if (children) {
        return `${indentStr}<${tag} ${attributes}>\n${children}\n${indentStr}</${tag}>`;
      } else {
        return `${indentStr}<${tag} ${attributes}>${content}</${tag}>`;
      }
    } else {
      return `${indentStr}<${tag} ${attributes}>${content}</${tag}>`;
    }
  }

  protected getOrCreateClass(element: EditorElement): string {
    // Handle element.styles which might have a 'default' property
    const styles = element.styles?.default || element.styles || {};
    const key = JSON.stringify(styles);
    if (this.cssClasses.has(key)) return this.cssClasses.get(key)!;
    const className = `class-${this.classCounter++}`;
    this.cssClasses.set(key, className);
    return className;
  }

  protected generateCSS(): string {
    let css = "";
    for (const [key, className] of this.cssClasses) {
      const parsedStyles = JSON.parse(key);
      // Handle if styles has a 'default' property or other structure
      const styles = (parsedStyles?.default || parsedStyles) as CSSStyles;

      // Skip if styles is empty or not an object
      if (
        !styles ||
        typeof styles !== "object" ||
        Object.keys(styles).length === 0
      ) {
        continue;
      }

      const cssRules = this.stylesToCSS(styles);
      if (cssRules) {
        css += `.${className} {\n  ${cssRules
          .split("; ")
          .filter((r) => r)
          .join(";\n  ")};\n}\n\n`;
      }
    }
    return css.trim();
  }

  protected stylesToCSS(styles: CSSStyles): string {
    return Object.entries(styles)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v}`)
      .join("; ");
  }

  protected generateJS(elements: EditorElement[]): string {
    let js = "";
    const hasCMS = elements.some((el) => el.type.startsWith("CMS"));
    if (hasCMS) {
      js += `
document.addEventListener('DOMContentLoaded', function() {
  // CMS fetching
  const cmsElements = document.querySelectorAll('[data-cms-type]');
  cmsElements.forEach(el => {
    const type = el.getAttribute('data-cms-type');
    const limit = el.getAttribute('data-limit');
    const slug = el.getAttribute('data-slug');
    if (slug) {
      fetch('/api/cms/' + type + '/' + slug)
        .then(res => res.json())
        .then(data => {
          el.innerHTML = '<h2>' + data.title + '</h2><div>' + data.content + '</div>';
        });
    } else {
      fetch('/api/cms/' + type + '?limit=' + (limit || 10))
        .then(res => res.json())
        .then(data => {
          const items = data.items || [];
          el.innerHTML = items.map(item => '<div><h3>' + item.title + '</h3><p>' + item.description + '</p></div>').join('');
        });
    }
  });
});
`;
    }
    // Add form handling if forms present
    const hasForm = elements.some((el) => el.type === "Form");
    if (hasForm) {
      js += `
// Form handling
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted');
  });
});
`;
    }
    return js;
  }

  protected generateFullPage(html: string, css: string, js: string): string {
    // Indent CSS rules
    const indentedCss = css
      ? css
        .split("\n")
        .map((line) => (line ? `    ${line}` : line))
        .join("\n")
      : "    /* No styles generated */";

    // Indent HTML content
    const indentedHtml = html
      ? html
        .split("\n")
        .map((line) => (line ? `  ${line}` : line))
        .join("\n")
      : "  <!-- No content generated -->";

    // Indent JS code
    const indentedJs = js
      ? js
        .split("\n")
        .map((line) => (line ? `    ${line}` : line))
        .join("\n")
      : "    // No JavaScript generated";

    // Get page metadata
    const pageTitle = this.options.page?.Name || "Exported Page";
    const pageType = this.options.page?.Type || "sp";
    const pageStyles = this.options.page?.Styles
      ? `\n    /* Page-level styles */\n${this.generatePageStyles(this.options.page.Styles)}`
      : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="page-type" content="${pageType}">
  <style>
${indentedCss}${pageStyles}
  </style>
</head>
<body>
${indentedHtml}

  <script>
${indentedJs}
  </script>
</body>
</html>`;
  }

  protected generatePageStyles(styles: Record<string, unknown>): string {
    if (!styles || typeof styles !== "object") return "";

    const cssRules: string[] = [];

    // Convert page-level styles to CSS
    Object.entries(styles).forEach(([selector, rules]) => {
      if (typeof rules === "object" && rules !== null) {
        const styleString = Object.entries(rules)
          .map(([prop, value]) => {
            const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
            return `  ${cssProp}: ${value};`;
          })
          .join("\n");

        if (styleString) {
          cssRules.push(`    ${selector} {\n${styleString}\n    }`);
        }
      }
    });

    return cssRules.length > 0 ? "\n" + cssRules.join("\n") : "";
  }

  protected async generateZipFile(result: GeneratedCode): Promise<Blob> {
    const zip = new JSZip();

    if (this.options.exportFormat === "react") {
      zip.file("App.js", result.reactApp || "");
      zip.file("components/index.js", result.reactIndex || "");
      if (result.reactComponents) {
        Object.entries(result.reactComponents).forEach(([filename, code]) => {
          zip.file(`components/${filename}`, code);
        });
      }
      zip.file("package.json", result.packageJson || "");
    } else {
      zip.file("index.html", result.fullPage);
      zip.file("styles.css", result.css);
      zip.file("script.js", result.js);
    }
    return await zip.generateAsync({ type: "blob" });
  }
}
