"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameComponent = renameComponent;
const path = __importStar(require("path"));
function findModuleFiles(tree, rootPath) {
    const moduleFiles = [];
    tree.getDir(rootPath).visit((filePath) => {
        if (filePath.endsWith(".module.ts")) {
            moduleFiles.push(filePath);
        }
    });
    return moduleFiles;
}
function toPascalCase(str) {
    return str
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
}
function updateFile(tree, filePath, oldName, newName, importFile, newNameForImportFile) {
    var _a;
    const content = (_a = tree.read(filePath)) === null || _a === void 0 ? void 0 : _a.toString("utf-8");
    if (content) {
        const oldComponentName = extractAppName(oldName);
        const newComponentName = extractAppName(newName);
        let routingModuleName = toPascalCase(oldComponentName);
        const updatedContent = content
            .replace(new RegExp(oldName, "g"), newName)
            .replace(new RegExp(importFile, "g"), newNameForImportFile)
            .replace(new RegExp(`app-${oldComponentName}`, "g"), `app-${newComponentName}`)
            .replace(new RegExp(`${routingModuleName}RoutingModule`, "g"), `${newName}RoutingModule`)
            .replace(new RegExp(`${oldComponentName}-routing.module`, "g"), `${newComponentName}-routing.module`);
        tree.overwrite(filePath, updatedContent);
    }
}
function renameComponent(options) {
    return (tree, _context) => {
        const { path: componentPath, old: oldName, new: newName } = options;
        const oldComponentName = extractAppName(oldName);
        const newComponentName = extractAppName(newName);
        const componentFolder = path.dirname(componentPath);
        const oldFilePath = componentPath;
        const newFilePath = path.join(componentFolder, `${newComponentName}.component.ts`);
        tree.rename(oldFilePath, newFilePath);
        const relatedFiles = [
            `${oldComponentName}.component.ts`,
            `${oldComponentName}.component.html`,
            `${oldComponentName}.component.scss`,
            `${oldComponentName}.module.ts`,
            `${oldComponentName}-routing.module.ts`,
            `${oldComponentName}.component.spec.ts`,
        ];
        relatedFiles.forEach((file) => {
            const oldFile = path.join(componentFolder, file);
            const newFile = path.join(componentFolder, file.replace(oldComponentName, newComponentName));
            if (tree.exists(oldFile)) {
                let moduleFiles = [
                    path.join(componentFolder, `${oldComponentName}-routing.module.ts`),
                    path.join(componentFolder, `${oldComponentName}.module.ts`),
                    path.join(componentFolder, `${newComponentName}.component.ts`),
                    path.join(componentFolder, `${oldComponentName}.component.spec.ts`),
                ];
                let moduleTSFiles = findModuleFiles(tree, "src/app");
                moduleFiles = [...moduleFiles, ...moduleTSFiles];
                moduleFiles.forEach((moduleFile) => {
                    if (tree.exists(moduleFile)) {
                        updateFile(tree, moduleFile, oldName, newName, `${oldComponentName}.component`, `${newComponentName}.component`);
                    }
                });
                tree.rename(oldFile, newFile);
            }
        });
        return tree;
    };
}
function extractAppName(componentName) {
    componentName = componentName.replace(/Component$/, "");
    return componentName
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();
}
//# sourceMappingURL=index.js.map