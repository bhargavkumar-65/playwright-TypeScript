# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Testing Commands
```bash
# Run all tests in production environment with 3 workers
npm run test:prod

# Run tests with specific project and shard
npm run shard -- --project=chromium --shard=1/3

# Run specific test file
npx playwright test src/test/typescript/testingMaster.spec.ts

# Run tests with UI mode for debugging
npx playwright test --ui

# Generate test code using codegen
npm run record
```

### Build and Development
```bash
# Build TypeScript files
npm run build

# Clean build artifacts
npm run clean

# Install dependencies
npm install
```

### Reporting
```bash
# Generate Allure report
npm run report

# Open Allure report
npm run allure:open

# Generate email report
npm run generateEmailReport

# Show Playwright report
npx playwright show-report
```

## Architecture Overview

### Project Structure
- **src/main/typescript/base/**: Base classes (BasePage.ts) and custom fixtures (customFixtures.ts)
- **src/main/typescript/helpers/**: Core utilities including Utility.ts (1400+ lines), Decorators.ts, and API testing components
- **src/main/typescript/pages/**: Page Object Model with separate actions/ and locators/ directories
- **src/test/typescript/**: Test specifications including UI and API tests
- **test-results/**, **playwright-report/**, **allure-results/**: Test execution artifacts

### Custom Fixtures System
The framework uses custom fixtures extending Playwright's base test. All page action classes are available as fixtures:
```typescript
test('example', async ({ homePageActions, articlePageActions, utility }) => {
  // Fixtures automatically injected
})
```

### Decorator System
The framework provides extensive decorators in `src/main/typescript/helpers/Decorators.ts`:
- `@Test`: Unified decorator supporting all test scenarios with data-driven capabilities
- `@step`, `@boxedStep`: Test step reporting
- `@timeout`, `@retry`: Test control flow
- `@performance`, `@screenshot`: Monitoring and documentation

### API Testing
API tests use structured approach with:
- Test data in `src/main/typescript/helpers/API/testData.ts`
- Request builders in `src/main/typescript/helpers/API/validRequestBodies.ts`
- Zod schemas in `src/main/typescript/helpers/API/Schemas/`
- Tests in `src/test/typescript/API/API.spec.ts`

### Key Configuration Files
- **playwright.config.ts**: Test runner configuration (timeout: 20min, workers: parallel, browser: chromium)
- **tsconfig.json**: TypeScript configuration with strict mode
- **.env**: Environment variables for BASE_URL, credentials, Azure DevOps integration
- **azure-pipelines.yml**: CI/CD pipeline with 3-shard parallel execution

### Environment Management
Environment configuration is centralized in `src/main/resources/env/env.ts`. Use environment variables:
- `environmentToRun`: Target environment (prod/dev)
- `BASE_URL`: Application URL
- `USERNAME`, `PASSWORD`: Test credentials
- Azure DevOps variables for API integration

### Testing Target
The framework tests https://testingmaster.in with comprehensive validation of:
- Article content and navigation
- Code syntax highlighting
- Responsive design
- Accessibility features

### Utility Class
The Utility class (`src/main/typescript/helpers/Utility.ts`) provides 100+ methods for:
- Element interactions with error handling
- Table/grid operations
- Date formatting and pickers
- File operations
- Frame and popup handling
- Performance monitoring

Use utility methods through the fixture or by instantiating: `const utility = new Utility(page)`

### Running Specific Test Scenarios
```bash
# Run tests by grep pattern
npx playwright test --grep "@smoke"

# Run in headed mode for debugging
npx playwright test --headed

# Run with specific browser
npx playwright test --project=chromium

# Debug specific test
npx playwright test --debug testingMaster.spec.ts
```

### Common Development Patterns
1. **Adding new page objects**: Create actions in `src/main/typescript/pages/actions/` and locators in `pages/locators/`
2. **Using decorators**: Import from `helpers/Decorators.ts` and apply to test methods
3. **API testing**: Use existing patterns in `src/test/typescript/API/` with schema validation
4. **Custom fixtures**: Add to `customFixtures.ts` and export through test object
5. **Environment-specific tests**: Use `@conditionalTest` decorator with environment checks