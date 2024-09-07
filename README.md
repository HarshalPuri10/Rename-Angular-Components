# Getting Started with Schematics
================================

This repository provides a basic Schematic implementation that serves as a starting point to create and publish Schematics to NPM. It includes a schematic that allows you to rename Angular components efficiently.

## Features
--------

### Rename Angular Component

Quickly rename an Angular component across your project files.

### Customizable Options

Specify the path, old name, and new name for the component.

## Installation
------------

To install and use the schematics, you first need to have `@angular-devkit/schematics-cli` globally installed. You can install it using:
```bash
npm install -g @angular-devkit/schematics-cli

eg: 
npx schematics rename-component:rename-component --path=src/app/hello/hello.component.ts --old=Hello --new=Bye