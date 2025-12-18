export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  children?: FileNode[];
  content?: string;
}

export interface ExportOptions {
  includeTailwind: boolean;
  responsiveBreakpoints: boolean;
  minify: boolean;
  exportFormat: "html" | "react" | "angular" | "vue";
}
