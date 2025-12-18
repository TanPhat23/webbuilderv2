/**
 * File utility functions for code export
 */

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    throw err;
  }
}

/**
 * Download a single file
 */
export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download all files as a ZIP
 */
export function downloadZip(
  zipBlob: Blob,
  exportFormat: "html" | "react" | "angular" | "vue"
): void {
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;

  const fileNames = {
    react: "react-app.zip",
    html: "html-export.zip",
    angular: "angular-app.zip",
    vue: "vue-app.zip"
  };

  a.download = fileNames[exportFormat] || "export.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function createZipFromFiles(
  files: Array<{ type: string; parentPath: string; name: string; content?: string }>
): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (const file of files) {
    if (file.type === "file" && file.content) {
      const fullPath = file.parentPath
        ? `${file.parentPath}/${file.name}`
        : file.name;
      zip.file(fullPath, file.content);
    }
  }

  return await zip.generateAsync({ type: "blob" });
}
