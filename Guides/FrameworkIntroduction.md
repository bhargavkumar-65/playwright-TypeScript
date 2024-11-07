# Automation Framework Walkthrough

## Introduction

This document provides a step-by-step guide to set up and use the common automation framework.

## Prerequisites

-   Visual Studio Code (VS Code)
-   Git

## Setup Instructions

### 1. Install Visual Studio Code

1. Download and install Visual Studio Code from the official website.
2. Once installed, open Visual Studio Code.

### 2. Clone the Automation Framework

1. Navigate to the automation project repository at `cognify.visualstudio.com`.
2. Go to `repos` and search for `common automation framework`.
3. Ensure you are on the `main` branch.
4. Click on the `Clone` button to get the Git clone command.
5. Open a command prompt and navigate to your desired directory (e.g., `C:\MDH`).
6. Run the following command to clone the repository:
    ```sh
    git clone <URL>
    ```

### 3. Configure the Environment

1. Identify all required elements for the logging base.
2. Automate the login scenario by writing a method for login.

### 4. Writing Methods

1. Start with the `async` keyword.
2. Name your method appropriately (e.g., `loginToHomePage`).
3. Use the following syntax to write the method:
    ```javascript
    async function loginToHomePage() {
        // Your code here
    }
    ```
4. Use `await` before every asynchronous operation.
5. Open the browser and launch the application using:
    ```javascript
    await page.goto('<URL>')
    ```

### 5. Environment Configuration

1. The base URL is stored in the `.env` file.
2. Ensure the `.env` file is imported from `helpers/env.ts`.

It looks like you want to continue writing the README.md file for your project. Here are some additional sections you might consider adding:

### Home Page

-   **Class Creation**: Create a class file named `HomePage`.
-   **Constructor**: Include a constructor that takes `page` as an input.
-   **Standard Format**: Follow the standard format for creating a new page.

### File Naming

-   **Consistency**: Ensure the file name and class name are the same for easy identification.
-   **Test Files**: Use the format `sanity-tests.spec.ts` for test files.

### Imports

-   **Standard Imports**: Import necessary modules like `test`, `expect`, and `page` from Playwright.
-   **Environment Variables**: Import environment variables from `.env`.

### Test Configuration

-   **Parallel Configuration**: Configure tests to run in parallel.
-   **Before Each Test**: Use `test.beforeEach` for setup tasks.

Feel free to modify these sections to better fit your project's needs!

## Conclusion

This guide covers the basic setup and initial steps to start using the common automation framework. For more detailed instructions, reachout to automation team.

```

Feel free to modify this as needed! If you have any specific details or additional steps you'd like to include, let me know.
```
