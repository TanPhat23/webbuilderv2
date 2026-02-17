import React, { useState, useEffect } from "react";
import { CMSContentGridElement } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import PreviewElementLoader from "./PreviewElementLoader";

interface PreviewCMSContentGridComponentProps {
  element: CMSContentGridElement;
  data?: any;
}

const PreviewCMSContentGridComponent = ({
  element,
  data,
}: PreviewCMSContentGridComponentProps) => {
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};
  const {
    contentTypeId,
    limit = 6,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = settings;

  useEffect(() => {
    if (!contentTypeId) return;

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        // This would need to be implemented based on your CMS API
        const response = await fetch(
          `/api/cms/${contentTypeId}?limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
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
    return (
      <div
        style={{
          ...safeStyles,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading content...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          ...safeStyles,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "red",
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1rem",
      }}
    >
      {contentItems.map((item, index) => (
        <div key={item.id || index} style={{ width: "100%" }}>
          <PreviewElementLoader
            elements={element.elements}
            data={item as unknown as Record<string, unknown>}
          />
        </div>
      ))}
    </div>
  );
};

export default PreviewCMSContentGridComponent;
