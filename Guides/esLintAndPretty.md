# Playwright Framework: TypeScript, Prettier, and ESLint Setup

This README provides an overview of the **Playwright framework** session where we covered essential aspects of TypeScript errors, using **Prettier** for code formatting, and **ESLint** for linting the Playwright tests. Additionally, we explored how to configure and apply linting and formatting rules for a cleaner, error-free codebase.

## Contents

-   [Introduction](#introduction)
-   [Prettier Setup](#prettier-setup)
-   [ESLint Setup](#eslint-setup)
-   [Running Linting and Formatting](#running-linting-and-formatting)
-   [Common Issues and Fixes](#common-issues-and-fixes)
-   [Further Reading](#further-reading)

## Introduction

In this session, we addressed the following key topics:

1. **Fixing TypeScript Errors**: How to identify and correct TypeScript errors in Playwright tests.
2. **Prettier**: Code formatting tool that ensures consistency in code structure.
3. **ESLint**: Static code analysis tool used to identify problematic patterns in JavaScript/TypeScript code.

## Prettier Setup

Prettier helps in maintaining a consistent code style across the project. Here’s how to set it up and run it:

1. Install Prettier:

    ```bash
    npm install --save-dev prettier
    ```

2. Create a `.prettierrc.js` configuration file:

    ```js
    module.exports = {
        arrowParens: 'avoid',
        endOfLine: 'lf',
        semi: false,
        trailingComma: 'all',
        singleQuote: true,
        printWidth: 120,
        tabWidth: 4,
        bracketSameLine: false,
        overrides: [
            {
                files: 'src/**/*.ts',
                options: {
                    printWidth: 250,
                },
            },
        ],
    }
    ```

3. Add a script to your `package.json`:

    ```json
    {
        "scripts": {
            "prettify": "prettier --config \".prettierrc.js\" --write \"./**/*.{ts,tsx,js,jsx,json,yaml,yml,eslintrc,md}\" "
        }
    }
    ```

4. Add .prettierignore:

    ```bash
    node_modules
    playwright-report
    test-results
    build-js/
    allure-results
    ```

5. Run Prettier to format your code:
    ```bash
    npm run prettify
    ```

## ESLint Setup

ESLint helps in identifying TypeScript and JavaScript issues that could lead to potential errors. Here’s how to configure ESLint for your Playwright project:

1. Add below to your devDependencies:

    ```json
        "eslint": "^8.30.0",
        "eslint-config-standard-with-typescript": "^24.0.0",
        "eslint-plugin-import": "^2.26.0",
        "eslint-plugin-n": "^15.6.0",
        "eslint-plugin-promise": "^6.1.1",
        "eslint-plugin-simple-import-sort": "^8.0.0"
    ```

2. Create an `.eslintrc.jon` file for configuration:

    ```json
    {
        "parser": "@typescript-eslint/parser",
        "parserOptions": {
            "project": "./tsconfig.json"
        },
        "plugins": ["@typescript-eslint", "simple-import-sort"],
        "rules": {
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/indent": "off",
            "@typescript-eslint/member-delimiter-style": [
                "error",
                {
                    "multiline": {
                        "delimiter": "none",
                        "requireLast": true
                    },
                    "singleline": {
                        "delimiter": "semi",
                        "requireLast": false
                    }
                }
            ],
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    "selector": "variable",
                    "format": ["camelCase", "UPPER_CASE", "PascalCase"],
                    "leadingUnderscore": "allow",
                    "trailingUnderscore": "forbid"
                }
            ],
            "@typescript-eslint/no-array-constructor": "error",
            "@typescript-eslint/no-this-alias": "error",
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
            "@typescript-eslint/quotes": ["error", "single"],
            "@typescript-eslint/semi": ["error", "never"],
            "@typescript-eslint/type-annotation-spacing": "off",
            //"arrow-body-style": ["error", "as-needed"],
            "arrow-parens": ["off", "always"],
            "brace-style": ["off", "off"],
            "comma-dangle": [
                "error",
                {
                    "objects": "always-multiline",
                    "arrays": "always-multiline",
                    "functions": "always-multiline"
                }
            ],
            "curly": ["error", "multi-line"],
            "eol-last": "off",
            "eqeqeq": ["error", "smart"],
            "id-denylist": [
                "error",
                "any",
                "Number",
                "number",
                "String",
                "string",
                "Boolean",
                "boolean",
                "Undefined",
                "undefined"
            ],
            "id-match": "error",
            "import/no-internal-modules": "off",
            "indent": "off",
            "linebreak-style": "off",
            "max-len": "off",
            "new-parens": "off",
            "newline-per-chained-call": "off",
            "no-array-constructor": "off",
            "no-console": "off",
            "no-duplicate-imports": "error",
            "no-else-return": "error",
            "no-eval": "error",
            "no-extra-semi": "error",
            "no-irregular-whitespace": "off",
            "no-multiple-empty-lines": "error",
            "no-multi-spaces": "error",
            "no-new-wrappers": "error",
            //"no-param-reassign": "error",
            //"no-plusplus": "error",
            "no-trailing-spaces": "off",
            "no-underscore-dangle": "off",
            "no-var": "error",
            "object-shorthand": "error",
            "one-var": ["error", "never"],
            "padded-blocks": [
                "off",
                {
                    "blocks": "never"
                },
                {
                    "allowSingleLineBlocks": true
                }
            ],
            "prefer-arrow/prefer-arrow-functions": "off",
            "prefer-const": "error",
            "prefer-template": "error",
            "quote-props": ["error", "as-needed"],
            "quotes": [2, "single"],
            "radix": "error",
            "semi": "off",
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "space-before-function-paren": "off",
            "space-in-parens": ["off", "never"],
            "spaced-comment": [
                "error",
                "always",
                {
                    "markers": ["/"]
                }
            ]
        }
    }
    ```

3. Add ESLint to the `package.json`:

    ```json
    {
        "scripts": {
            "lint": "eslint --ignore-path .eslintignore --ext .js,.ts,.tsx .",
            "lintFix": "eslint --fix src/**/*.ts"
        }
    }
    ```

4. Add .prettierignore:

    ```bash
    node_modules/
    /test-results/
    /playwright-report/
    /playwright/.cache/
    logs/
    build-js/
    ```

5. Run ESLint:

    ```bash
    npm run lint
    ```

6. To automatically fix issues, run:
    ```bash
    npm run lintFix
    ```

## Running Linting and Formatting

-   **Run Prettier**: Formats the code to maintain style consistency.

    ```bash
    npm run pretty
    ```

-   **Run ESLint**: Detects issues in the code.

    ```bash
    npm run lint
    ```

-   **Auto-fix issues**: Fixes minor issues automatically.
    ```bash
    npm run lintFix
    ```

## Common Issues and Fixes by linting

1. **Unnecessary `await` in Promises**: Some Playwright functions do not return promises. Make sure to check if the function is synchronous or asynchronous and avoid using `await` where not necessary.

    ```javascript
    // Example fix
    const element = await page.getByText('Submit') // Incorrect
    const element = page.getByText('Submit') // Correct
    ```

2. **Extra Semicolons**: ESLint rules help catch unnecessary semicolons.

    ```javascript
    const name = 'Playwright' // Incorrect
    const name = 'Playwright' // Correct
    const name = 'Playwright' // Correct
    ```

3. **Quotes Mismatch**: Ensure consistent usage of single or double quotes as per the ESLint configuration.

    ```javascript
    const message = 'Hello' // Incorrect
    const message = 'Hello' // Correct
    ```

4. **Missing `await`**: ESLint warns if a promise is not awaited, which can lead to runtime issues.
    ```javascript
    await page.click('button') // Correct if it returns a promise.
    ```

## Further Reading

-   [TypeScript-ESLint Documentation](https://typescript-eslint.io/)
-   [Prettier Documentation](https://prettier.io/)

## Conclusion

By integrating Prettier and ESLint into your Playwright framework, you ensure that your TypeScript code is consistent, error-free, and well-formatted. Follow the configurations and scripts mentioned above to streamline your development process and improve code quality.

Happy Testing!

---
