import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import * as path from "path";

function findModuleFiles(tree: Tree, rootPath: string): string[] {
  const moduleFiles: string[] = [];
  tree.getDir(rootPath).visit((filePath) => {
    if (filePath.endsWith(".module.ts")) {
      moduleFiles.push(filePath);
    }
  });
  return moduleFiles;
}
function toPascalCase(str: string) {
  return str
    .split("-")
    .map(
      (word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
}
function updateFile(
  tree: Tree,
  filePath: string,
  oldName: string,
  newName: string,
  importFile: string,
  newNameForImportFile: string
): void {
  const content = tree.read(filePath)?.toString("utf-8");
  if (content) {
    const oldComponentName = extractAppName(oldName);
    const newComponentName = extractAppName(newName);
    let routingModuleName = toPascalCase(oldComponentName);

    const updatedContent = content
      .replace(new RegExp(oldName, "g"), newName)
      .replace(new RegExp(importFile, "g"), newNameForImportFile)
      .replace(
        new RegExp(`app-${oldComponentName}`, "g"),
        `app-${newComponentName}`
      )
      .replace(
        new RegExp(`${routingModuleName}RoutingModule`, "g"),
        `${newName}RoutingModule`
      )
      .replace(
        new RegExp(`${oldComponentName}-routing.module`, "g"),
        `${newComponentName}-routing.module`
      );
    tree.overwrite(filePath, updatedContent);
  }
}

function renameComponent(options: {
  path: string;
  old: string;
  new: string;
}): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const { path: componentPath, old: oldName, new: newName } = options;

    const oldComponentName = extractAppName(oldName);
    const newComponentName = extractAppName(newName);

    const componentFolder = path.dirname(componentPath);
    const oldFilePath = componentPath;
    const newFilePath = path.join(
      componentFolder,
      `${newComponentName}.component.ts`
    );
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

      const newFile = path.join(
        componentFolder,
        file.replace(oldComponentName, newComponentName)
      );

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
            updateFile(
              tree,
              moduleFile,
              oldName,
              newName,
              `${oldComponentName}.component`,
              `${newComponentName}.component`
            );
          }
        });
        tree.rename(oldFile, newFile);
      }
    });
    return tree;
  };
}

export { renameComponent };
function extractAppName(componentName: string) {
  componentName = componentName.replace(/Component$/, "");

  return componentName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}
