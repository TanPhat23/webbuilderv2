import { EditorElement } from "@/types/global.type";
import { GeneratedCode } from "./codeGenerator";

export interface FileTreeNode {
    type: "file" | "folder";
    parentPath: string;
    name: string;
    content?: string;
}

/**
 * Convert generated code to file tree structure for AI processing
 */
export function convertCodeToFileTree(
    code: GeneratedCode,
    exportFormat: "html" | "react" | "vue" | "angular"
): FileTreeNode[] {
    const fileTree: FileTreeNode[] = [];

    if (exportFormat === "react") {
        // Root folder
        fileTree.push({
            type: "folder",
            parentPath: "",
            name: "react-app"
        });

        // src folder
        fileTree.push({
            type: "folder",
            parentPath: "react-app",
            name: "src"
        });

        // components folder
        fileTree.push({
            type: "folder",
            parentPath: "react-app/src",
            name: "components"
        });

        // App.js
        if (code.reactApp) {
            fileTree.push({
                type: "file",
                parentPath: "react-app/src",
                name: "App.js",
                content: code.reactApp
            });
        }

        // Component files
        if (code.reactComponents) {
            Object.entries(code.reactComponents).forEach(([filename, content]) => {
                fileTree.push({
                    type: "file",
                    parentPath: "react-app/src/components",
                    name: filename,
                    content
                });
            });
        }

        // index.js
        if (code.reactIndex) {
            fileTree.push({
                type: "file",
                parentPath: "react-app/src/components",
                name: "index.js",
                content: code.reactIndex
            });
        }

        // package.json
        if (code.packageJson) {
            fileTree.push({
                type: "file",
                parentPath: "react-app",
                name: "package.json",
                content: code.packageJson
            });
        }
    } else if (exportFormat === "html") {
        // Root folder
        fileTree.push({
            type: "folder",
            parentPath: "",
            name: "html-project"
        });

        // index.html
        fileTree.push({
            type: "file",
            parentPath: "html-project",
            name: "index.html",
            content: code.fullPage
        });

        // styles.css
        if (code.css) {
            fileTree.push({
                type: "file",
                parentPath: "html-project",
                name: "styles.css",
                content: code.css
            });
        }

        // script.js
        if (code.js) {
            fileTree.push({
                type: "file",
                parentPath: "html-project",
                name: "script.js",
                content: code.js
            });
        }
    } else if (exportFormat === "vue" || exportFormat === "angular") {
        // For Vue/Angular, send the React code as template for AI to convert
        fileTree.push({
            type: "folder",
            parentPath: "",
            name: exportFormat === "vue" ? "vue-app" : "angular-app"
        });

        fileTree.push({
            type: "file",
            parentPath: exportFormat === "vue" ? "vue-app" : "angular-app",
            name: "template.txt",
            content: code.reactApp || code.fullPage
        });

        if (code.packageJson) {
            fileTree.push({
                type: "file",
                parentPath: exportFormat === "vue" ? "vue-app" : "angular-app",
                name: "package.json",
                content: code.packageJson
            });
        }
    }

    return fileTree;
}

/**
 * Convert elements to simplified file tree for display
 */
export function convertElementsToFileTree(elements: EditorElement[]): FileTreeNode[] {
    const fileTree: FileTreeNode[] = [];

    // Group elements by type
    const elementsByType = elements.reduce((acc, el) => {
        if (!acc[el.type]) {
            acc[el.type] = [];
        }
        acc[el.type].push(el);
        return acc;
    }, {} as Record<string, EditorElement[]>);

    // Create a simple representation
    fileTree.push({
        type: "folder",
        parentPath: "",
        name: "components"
    });

    Object.entries(elementsByType).forEach(([type, els]) => {
        els.forEach((el, index) => {
            const fileName = `${type}${index + 1}.jsx`;
            const content = `// ${el.name || type}\n// ID: ${el.id}\n// Type: ${el.type}`;

            fileTree.push({
                type: "file",
                parentPath: "components",
                name: fileName,
                content
            });
        });
    });

    return fileTree;
}
