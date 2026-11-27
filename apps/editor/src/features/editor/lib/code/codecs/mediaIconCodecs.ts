import * as t from "@babel/types";
import { lucideKebabToPascal } from "../catalog";
import { classNameAttr, codePropNames, selfClosingJsxEl, settingsToAttributes } from "./shared";
import type { ElementCodec } from "./types";

const ICON_SKIP: ReadonlySet<string> = new Set(["iconName"]);
const MEDIA_RENAME: Readonly<Record<string, string>> = { autoplay: "autoPlay" };

export const iconCodec: ElementCodec<"Icon"> = {
  type: "Icon",
  generate(element, ctx) {
    const iconName = element.settings?.iconName ?? "star";
    const pascal = lucideKebabToPascal(iconName);
    ctx.usedLucideIcons.add(pascal);
    const attrs = [
      classNameAttr(element),
      ...settingsToAttributes(element.settings, ICON_SKIP),
    ];
    return selfClosingJsxEl(pascal, attrs);
  },
};

export const imageCodec: ElementCodec<"Image"> = {
  type: "Image",
  generate(element) {
    const overridden = codePropNames(element.settings);
    const attrs: t.JSXAttribute[] = [classNameAttr(element)];
    if (element.src && !overridden.has("src")) {
      attrs.push(t.jsxAttribute(t.jsxIdentifier("src"), t.stringLiteral(element.src)));
    }
    if (!overridden.has("alt")) {
      attrs.push(
        t.jsxAttribute(t.jsxIdentifier("alt"), t.stringLiteral(element.content || "")),
      );
    }
    attrs.push(...settingsToAttributes(element.settings));
    return selfClosingJsxEl("img", attrs);
  },
};

export const videoCodec: ElementCodec<"Video"> = {
  type: "Video",
  generate(element) {
    const overridden = codePropNames(element.settings);
    const attrs: t.JSXAttribute[] = [classNameAttr(element)];
    if (element.src && !overridden.has("src")) {
      attrs.push(t.jsxAttribute(t.jsxIdentifier("src"), t.stringLiteral(element.src)));
    }
    attrs.push(...settingsToAttributes(element.settings, undefined, MEDIA_RENAME));
    return selfClosingJsxEl("video", attrs);
  },
};

export const audioCodec: ElementCodec<"Audio"> = {
  type: "Audio",
  generate(element) {
    const overridden = codePropNames(element.settings);
    const attrs: t.JSXAttribute[] = [classNameAttr(element)];
    if (element.src && !overridden.has("src")) {
      attrs.push(t.jsxAttribute(t.jsxIdentifier("src"), t.stringLiteral(element.src)));
    }
    attrs.push(...settingsToAttributes(element.settings, undefined, MEDIA_RENAME));
    return selfClosingJsxEl("audio", attrs);
  },
};

export const iframeCodec: ElementCodec<"IFrame"> = {
  type: "IFrame",
  generate(element) {
    const overridden = codePropNames(element.settings);
    const attrs: t.JSXAttribute[] = [classNameAttr(element)];
    if (element.src && !overridden.has("src")) {
      attrs.push(t.jsxAttribute(t.jsxIdentifier("src"), t.stringLiteral(element.src)));
    }
    attrs.push(...settingsToAttributes(element.settings));
    return selfClosingJsxEl("iframe", attrs);
  },
};
