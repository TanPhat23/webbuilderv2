import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { HydrationBoundary, useQuery } from "@tanstack/react-query";
import { i as elementHelper } from "./prisma-BUnO9f9X.js";
import "sonner";
import { p as projectService } from "./project.service-Bci2lGYe.js";
import { useState, useEffect } from "react";
import { R as Route, e as elementService } from "./router-BlPuUPbX.js";
import "clsx";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import DOMPurify from "isomorphic-dompurify";
import { C as Carousel, a as CarouselContent, b as CarouselItem, c as CarouselPrevious, d as CarouselNext } from "./carousel-CEa84Ygm.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
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
import "@tanstack/react-router";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "react-hook-form";
import "lucide-react";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "@clerk/react/internal";
import "./index-CSLGDVeV.js";
import "@clerk/shared/error";
import "./env-VSwWZfm9.js";
import "@clerk/shared/getEnvVariable";
import "@clerk/shared/underscore";
import "@clerk/react";
import "./auth-BkVoR3zB.js";
import "@clerk/backend/internal";
import "@clerk/backend";
import "@babel/generator";
import "@babel/types";
import "embla-carousel-react";
const PreviewBaseComponent = ({ element, data }) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  let content = (typeof data === "string" ? data : "") || (typeof data === "object" && data && typeof data.content === "string" ? data.content : "") || (typeof element.content === "string" ? element.content : "") || "";
  if (typeof element.content === "string" && data && typeof data === "object") {
    content = elementHelper.replacePlaceholders(element.content, data);
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: element.tailwindStyles,
      style: safeStyles,
      dangerouslySetInnerHTML: {
        __html: DOMPurify.sanitize(content)
      }
    }
  );
};
const PreviewButtonComponent = ({ element }) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: element.tailwindStyles,
      style: safeStyles,
      dangerouslySetInnerHTML: {
        __html: DOMPurify.sanitize(element.content || "Button")
      }
    }
  );
};
const PreviewCMSContentGridComponent = ({
  element,
  data
}) => {
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};
  const {
    contentTypeId,
    limit = 6,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = settings;
  useEffect(() => {
    if (!contentTypeId) return;
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/cms/${contentTypeId}?limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setContentItems(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [contentTypeId, limit, sortBy, sortOrder]);
  if (loading) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          ...safeStyles,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        children: "Loading content..."
      }
    );
  }
  if (error) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          ...safeStyles,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "red"
        },
        children: [
          "Error: ",
          error
        ]
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        ...safeStyles,
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1rem"
      },
      children: contentItems.map((item, index) => /* @__PURE__ */ jsx("div", { style: { width: "100%" }, children: /* @__PURE__ */ jsx(
        PreviewElementLoader,
        {
          elements: element.elements,
          data: item
        }
      ) }, item.id || index))
    }
  );
};
const PreviewCMSContentItemComponent = ({
  element,
  data
}) => {
  const [contentItem, setContentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};
  const { contentTypeId, itemSlug } = settings;
  useEffect(() => {
    if (!contentTypeId || !itemSlug) return;
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/cms/${contentTypeId}/item/${itemSlug}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setContentItem(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [contentTypeId, itemSlug]);
  if (loading) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          ...safeStyles,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        children: "Loading content..."
      }
    );
  }
  if (error) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          ...safeStyles,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "red"
        },
        children: [
          "Error: ",
          error
        ]
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { className: element.tailwindStyles, style: safeStyles, children: /* @__PURE__ */ jsx(
    PreviewElementLoader,
    {
      elements: element.elements,
      data: contentItem
    }
  ) });
};
const PreviewCMSContentListComponent = ({
  element,
  data
}) => {
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};
  const {
    contentTypeId,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = settings;
  useEffect(() => {
    if (!contentTypeId) return;
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/cms/${contentTypeId}?limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setContentItems(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [contentTypeId, limit, sortBy, sortOrder]);
  if (loading) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          ...safeStyles,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        children: "Loading content..."
      }
    );
  }
  if (error) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          ...safeStyles,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "red"
        },
        children: [
          "Error: ",
          error
        ]
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { className: element.tailwindStyles, style: safeStyles, children: contentItems.map((item, index) => /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
    PreviewElementLoader,
    {
      elements: element.elements,
      data: item
    }
  ) }, item.id || index)) });
};
const PreviewCarouselComponent = ({
  element,
  data
}) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  const carouselSettings = element.settings || {};
  const hasNavigation = carouselSettings.withNavigation ?? true;
  if (!element || !element.elements) {
    return /* @__PURE__ */ jsx("div", { children: "No carousel content available." });
  }
  return /* @__PURE__ */ jsx("div", { className: element.tailwindStyles, style: safeStyles, children: /* @__PURE__ */ jsxs(
    Carousel,
    {
      opts: {
        align: "start",
        loop: true,
        ...carouselSettings
      },
      children: [
        /* @__PURE__ */ jsx(CarouselContent, { children: element.elements.map((item, index) => /* @__PURE__ */ jsx(CarouselItem, { children: /* @__PURE__ */ jsx(PreviewElementLoader, { elements: [item], data }) }, item.id || index)) }),
        hasNavigation && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(CarouselPrevious, {}),
          /* @__PURE__ */ jsx(CarouselNext, {})
        ] })
      ]
    }
  ) });
};
const PreviewFormComponent = ({ element, data }) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};
  return /* @__PURE__ */ jsx(
    "form",
    {
      action: settings.action,
      method: settings.method || "post",
      target: settings.target,
      encType: settings.encType,
      acceptCharset: settings.acceptCharset,
      className: element.tailwindStyles,
      style: safeStyles,
      children: /* @__PURE__ */ jsx(PreviewElementLoader, { elements: element.elements, data })
    }
  );
};
const PreviewFrameComponent = ({
  element,
  data
}) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  return /* @__PURE__ */ jsx("div", { className: element.tailwindStyles, style: safeStyles, children: /* @__PURE__ */ jsx(PreviewElementLoader, { elements: element.elements, data }) });
};
const PreviewImageComponent = ({ element }) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: element.src || "",
      alt: element.content || "Image",
      className: element.tailwindStyles,
      style: {
        ...safeStyles,
        objectFit: "cover"
      }
    }
  );
};
const PreviewInputComponent = ({ element }) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};
  return /* @__PURE__ */ jsx(
    "input",
    {
      type: settings.type || "text",
      placeholder: settings.placeholder || element.content || "Input field",
      defaultValue: settings.defaultValue || "",
      min: settings.min,
      max: settings.max,
      step: settings.step,
      required: settings.required,
      pattern: settings.pattern,
      autoComplete: settings.autoComplete,
      className: element.tailwindStyles,
      style: safeStyles
    }
  );
};
const PreviewListComponent = ({ element, data }) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  Array.isArray(data) ? data : element.elements || [];
  if (Array.isArray(data)) {
    return /* @__PURE__ */ jsx("ul", { className: element.tailwindStyles, style: safeStyles, children: data.map((item, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(PreviewElementLoader, { elements: element.elements, data: item }) }, index)) });
  }
  return /* @__PURE__ */ jsx("ul", { className: element.tailwindStyles, style: safeStyles, children: /* @__PURE__ */ jsx(PreviewElementLoader, { elements: element.elements, data }) });
};
const PreviewSectionComponent = ({
  element,
  data
}) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  return /* @__PURE__ */ jsx("section", { className: element.tailwindStyles, style: safeStyles, children: /* @__PURE__ */ jsx(PreviewElementLoader, { elements: element.elements, data }) });
};
const PreviewSelectComponent = ({ element }) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  return /* @__PURE__ */ jsxs("select", { className: element.tailwindStyles, style: safeStyles, children: [
    /* @__PURE__ */ jsx("option", { value: "", children: element.content || "Select an option" }),
    element.elements?.map((option, index) => /* @__PURE__ */ jsx("option", { value: option.content || "", children: option.content || `Option ${index + 1}` }, index))
  ] });
};
const PreviewComponentMap = /* @__PURE__ */ new Map([
  ["Text", PreviewBaseComponent],
  ["Button", PreviewButtonComponent],
  ["Section", PreviewSectionComponent],
  ["Image", PreviewImageComponent],
  ["Input", PreviewInputComponent],
  ["Select", PreviewSelectComponent],
  ["Link", PreviewBaseComponent],
  ["Form", PreviewFormComponent],
  ["Frame", PreviewFrameComponent],
  ["Carousel", PreviewCarouselComponent],
  ["List", PreviewListComponent],
  ["CMSContentList", PreviewCMSContentListComponent],
  ["CMSContentItem", PreviewCMSContentItemComponent],
  ["CMSContentGrid", PreviewCMSContentGridComponent]
]);
const getPreviewComponentMap = (elementType) => {
  return PreviewComponentMap.get(elementType);
};
function PreviewElementLoader({
  elements,
  data
} = {}) {
  const renderElement = (element) => {
    const Component = getPreviewComponentMap(element.type);
    return Component ? /* @__PURE__ */ jsx(Component, { element, data }, element.id) : null;
  };
  return /* @__PURE__ */ jsx(Fragment, { children: elements?.map((element) => renderElement(element)) });
}
function PreviewPage() {
  const {
    id
  } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const dehydratedState = loaderData?.dehydratedState;
  return /* @__PURE__ */ jsx(HydrationBoundary, { state: dehydratedState, children: /* @__PURE__ */ jsx(PreviewRenderer, { projectId: id }) });
}
function PreviewRenderer({
  projectId
}) {
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getProjectPublic(projectId)
  });
  const {
    data: elements,
    isLoading: elementsLoading,
    error: elementsError
  } = useQuery({
    queryKey: ["elements", projectId],
    queryFn: () => elementService.getElementsPublic(projectId)
  });
  if (projectLoading || elementsLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen min-w-screen", children: /* @__PURE__ */ jsx("div", { className: "text-lg", children: "Loading preview..." }) });
  }
  if (projectError || elementsError) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen min-w-screen", children: /* @__PURE__ */ jsxs("div", { className: "text-lg text-destructive", children: [
      "Error loading preview:",
      " ",
      projectError?.message || elementsError?.message
    ] }) });
  }
  if (!project || !elements) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsx("div", { className: "text-lg", children: "Project not found" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen min-w-screen bg-white", children: [
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: {
      __html: project.styles?.css || ""
    } }),
    /* @__PURE__ */ jsx(PreviewElementLoader, { elements })
  ] });
}
export {
  PreviewPage as component
};
