---

# Playwright TypeScript Test Framework

This repository contains an automated testing framework using Playwright with TypeScript.

## Project Structure

```bash
Guides
├── esLintAndPretty.md
├── FrameworkIntroduction.md
├── FrameworkStrucutre.md
src
├── main
│   ├── resources
│   │   └── env
│   │       └── envConfig.json
│   └── typescript
│       ├── base
│       │   └── BasePage.ts
│       ├── helpers
│       │   ├── env.ts
│       │   ├── global-setup.ts
│       │   ├── log.ts
│       │   └── Utility.ts
│       └── pages
│           ├── actions
│           └── locators
├── test
│   ├── resources
│   └── typescript
│       └── StandardTestSpecFile.spec.ts
```

### Folder Descriptions

#### `src/main/resources/env`
This folder contains environment-specific configuration files:
- **`envConfig.json`**: JSON configuration file for managing environment-specific settings.

#### `src/main/typescript/base`
- **`BasePage.ts`**: The base class for page objects, containing common functionality used across different pages.

#### `src/main/typescript/helpers`
- **`env.ts`**: Helper functions related to environment management and configurations.
- **`global-setup.ts`**: Global setup logic to be executed before the test suite runs, such as setting up browser contexts.
- **`log.ts`**: A utility for logging, responsible for handling and managing test logs.
- **`Utility.ts`**: Generic utility functions used across the framework.

#### `src/main/typescript/pages`
This folder is structured to follow the page object model, separating **actions** and **locators** for better test structure and reusability.

#### `test/resources`
Additional resources required for test cases, such as mock data or test files.

#### `test/typescript`
- **`StandardTestSpecFile.spec.ts`**: A sample test specification file demonstrating how tests are organized and executed.

## How to Use

### Customizing Environments

You can switch between different environment configurations by updating the `env.json` file located in the `resources/env` folder. The framework will pick up environment-specific details such as credentials and URLs automatically.

### Global Setup

Global setup ensures the environment and browser contexts are properly initialized before the test suite runs. It is defined in `global-setup.ts`.

---

This README provides an overview of the folder structure, key files, and instructions for setting up and running the Playwright TypeScript test framework. Let me know if you'd like any modifications!
