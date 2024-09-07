import { Rule } from "@angular-devkit/schematics";
declare function renameComponent(options: {
    path: string;
    old: string;
    new: string;
}): Rule;
export { renameComponent };
