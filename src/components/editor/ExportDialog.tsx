"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Code } from "lucide-react";
import { useElementStore } from "@/globalstore/elementstore";
import { usePageStore } from "@/globalstore/pagestore";
import {
  generateCodeFromElements,
  GeneratedCode,
} from "@/lib/utils/code-export/codeGenerator";
import { EditorElement } from "@/types/global.type";
import { CodeEditor } from "./codeexport/CodeEditor";
import { FileTree } from "./codeexport/FileTree";
import { ExportOptions as ExportOptionsComponent } from "./codeexport/ExportOptions";
import { FileActions } from "./codeexport/FileActions";
import { buildFileStructure } from "./codeexport/fileStructureBuilder";
import {
  copyToClipboard,
  downloadFile,
  downloadZip,
  createZipFromFiles,
} from "./codeexport/fileUtils";
import { ExportOptions, FileNode } from "./codeexport/types";
import { aiExportService } from "@/services/aiexportcode";
import { convertCodeToFileTree } from "@/lib/utils/code-export/elementToFileTree";

interface ExportDialogProps {
  children?: React.ReactNode;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ children }) => {
  const { elements } = useElementStore();
  const { currentPage } = usePageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeTailwind: false,
    responsiveBreakpoints: true,
    minify: false,
    exportFormat: "html",
  });
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({
    html: "",
    css: "",
    js: "",
    fullPage: "",
    reactApp: "",
    reactComponents: {},
    reactIndex: "",
    packageJson: "",
  });
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedContent, setSelectedContent] = useState("");
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (isOpen && elements.length > 0) {
      console.log("Generating code for", elements.length, "elements");
      console.log("Export options:", options);
      setIsGenerating(true);

      generateCodeFromElements(elements as EditorElement[], {
        ...options,
        page: currentPage || undefined,
      })
        .then(async (code) => {
          setGeneratedCode(code);

          // Convert code to file tree format
          const fileTree = convertCodeToFileTree(code, options.exportFormat);
          try {
            // Send to AI server for reconstruction
            const reconstructed = await aiExportService.reconstructProject(fileTree);

            // Convert reconstructed data to FileNode structure for display
            const structure = convertToFileNodes(reconstructed);
            setFileStructure(structure);

            // Create ZIP from reconstructed files
            const zip = await createZipFromFiles(reconstructed);
            setZipBlob(zip);

            // Select first file
            if (structure.length > 0) {
              const firstFile = findFirstFile(structure);
              if (firstFile) {
                setSelectedFile(firstFile.path);
                setSelectedContent(firstFile.content || "");
              }
            }
          } catch (error) {
            console.error("AI reconstruction failed:", error);
            // Fallback to local generation
            console.log("Using local generation as fallback");
            const structure = buildFileStructure(code, options);
            setFileStructure(structure);

            if (structure.length > 0) {
              setSelectedFile(structure[0].path);
              setSelectedContent(structure[0].content || "");
            }

            // Create ZIP for local
            const localFiles = structure.map(node => ({
              type: node.type,
              parentPath: node.path.includes('/') ? node.path.substring(0, node.path.lastIndexOf('/')) : '',
              name: node.name,
              content: node.content
            }));
            const zip = await createZipFromFiles(localFiles);
            setZipBlob(zip);
          }

          setIsGenerating(false);
        })
        .catch((err) => {
          console.error("Error generating code:", err);
          setIsGenerating(false);
        });
    } else if (isOpen) {
      console.warn("Export dialog opened but no elements found");
    }
  }, [elements, options, isOpen, currentPage]);

  const handleOptionChange = (option: keyof ExportOptions, value?: any) => {
    setOptions((prev) => ({
      ...prev,
      [option]: value !== undefined ? value : !prev[option],
    }));
  };

  const handleCopy = async (text: string) => {
    try {
      await copyToClipboard(text);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleDownloadAll = () => {
    if (zipBlob && !isGenerating) {
      downloadZip(zipBlob, options.exportFormat);
    }
  };

  const handleFileSelect = (path: string, content: string) => {
    setSelectedFile(path);
    setSelectedContent(content);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Code className="w-4 h-4 mr-2" />
            Export Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="!max-w-[75vw] max-h-[95vh] h-[75vw] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Editor Components as Code</DialogTitle>
          <DialogDescription>
            Generate HTML, React, Vue, or Angular code from your editor components.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {isGenerating ? (
            <div className="flex items-center justify-center w-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Processing with AI...</span>
            </div>
          ) : (
            <>
              <FileTree
                files={fileStructure}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
              />
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b space-y-4">
                  <ExportOptionsComponent
                    options={options}
                    onOptionChange={handleOptionChange}
                    isGenerating={isGenerating}
                  />
                  <FileActions
                    selectedFile={selectedFile}
                    selectedContent={selectedContent}
                    onCopy={handleCopy}
                    onDownload={downloadFile}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <CodeEditor
                    fileName={selectedFile}
                    content={selectedContent}
                    onChange={(content: string) => setSelectedContent(content)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDownloadAll}
            disabled={isGenerating || !zipBlob}
          >
            <Download className="w-4 h-4 mr-2" />
            Download All Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper functions
function convertToFileNodes(reconstructed: any[]): FileNode[] {
  const nodes: FileNode[] = [];
  const nodeMap = new Map<string, FileNode>();

  // Create all nodes
  for (const item of reconstructed) {
    const fullPath = item.parentPath ? `${item.parentPath}/${item.name}` : item.name;
    const node: FileNode = {
      name: item.name,
      type: item.type,
      path: fullPath,
      content: item.content,
      children: item.type === "folder" ? [] : undefined,
    };
    nodeMap.set(fullPath, node);
  }

  // Build tree structure
  for (const item of reconstructed) {
    const fullPath = item.parentPath ? `${item.parentPath}/${item.name}` : item.name;
    const node = nodeMap.get(fullPath);

    if (node) {
      if (item.parentPath) {
        const parent = nodeMap.get(item.parentPath);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      } else {
        nodes.push(node);
      }
    }
  }

  return nodes;
}

function findFirstFile(nodes: FileNode[]): FileNode | null {
  for (const node of nodes) {
    if (node.type === "file") {
      return node;
    }
    if (node.children) {
      const found = findFirstFile(node.children);
      if (found) return found;
    }
  }
  return null;
}

export default ExportDialog;
