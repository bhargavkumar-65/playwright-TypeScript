# Playwright API Testing Framework

Welcome to the **Playwright API Testing Framework** documentation. This framework provides a robust solution for API testing using Playwright's built-in request context capabilities with TypeScript.

## Contents

- [Introduction](#introduction)
- [Framework Structure](#framework-structure)
- [Test Data Management](#test-data-management)
- [API Test Examples](#api-test-examples)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Introduction

This Playwright API testing framework is designed for comprehensive REST API testing. It leverages Playwright's native request capabilities to perform HTTP operations and validate responses across different endpoints.

### Key Features

- **Cross-browser compatibility** with Chromium, Firefox, and WebKit
- **Built-in request context** for API calls
- **TypeScript support** for type safety
- **Data-driven testing** with parameterized test cases
- **Custom fixtures** for enhanced test capabilities
- **Comprehensive assertions** for response validation

## Framework Structure

```
src/
├── main/typescript/
│   ├── base/
│   │   └── customFixtures.ts          # Custom test fixtures
│   └── helpers/
│       ├── API/
│       │   ├── testData.ts            # Test data sets
│       │   └── validRequestBodies.ts  # Request body builders
│       └── Utility.ts                 # Utility functions
└── test/typescript/
    └── API.spec.ts                    # API test specifications
```

### Core Components

#### 1. Test Data (`testData.ts`)
Centralized test data management for different API scenarios:

```typescript
export const createPetData = [
    { name: 'Fluffy', id: 123, status: 'available' },
    { name: 'Buddy', id: 456, status: 'pending' },
    { name: 'Max', id: 789, status: 'sold' },
]

export const petStatusData = ['available', 'pending', 'sold']
export const negativePetStatusData = ['Notavailable', 'Notpending', 'Notsold']
```

#### 2. Request Body Builders (`validRequestBodies.ts`)
Reusable functions for creating API request payloads:

```typescript
export function createPetRequestBody(name: string, id: number, status: string) {
    return {
        id,
        category: { id: 1, name: 'Dogs' },
        name,
        photoUrls: ['string'],
        tags: [{ id: 1, name: 'tag1' }],
        status,
    }
}
```

#### 3. Custom Fixtures (`customFixtures.ts`)
Enhanced test context with utility functions and request capabilities.

#### 4. Schema Validation (`Schemas/`)
Zod schema definitions for response validation:

```typescript
// GET_PetByStatus.ts
import { z } from 'zod'

export const GET_PetByStatusSchema = z.array(
    z.object({
        id: z.number(),
        name: z.string(),
        status: z.enum(['available', 'pending', 'sold']),
        category: z.object({
            id: z.number(),
            name: z.string()
        }),
        photoUrls: z.array(z.string()),
        tags: z.array(z.object({
            id: z.number(),
            name: z.string()
        })).optional()
    })
)
```

## API Test Examples

### Positive Test Cases

#### 1. Create Pet (POST)
```typescript
test(`POST Add New Pet ${petData.name}`, async ({ request }) => {
    const response = await request.post(`/v2/pet`, {
        data: createPetRequestBody(petData.name, petData.id, petData.status),
    })

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/json')

    const responseBody = await response.json()
    expect(responseBody.status).toBe(petData.status)
    expect(responseBody.id).toBe(petData.id)
})
```

#### 2. Update Pet (PUT)
```typescript
test(`PUT Update Pet ${updateData.name}`, async ({ request }) => {
    const response = await request.put(`/v2/pet`, {
        data: createPetRequestBody(updateData.name, updateData.id, updateData.status),
    })

    expect(response.status()).toBe(200)
    const responseBody = await response.json()
    expect(responseBody.status).toBe(updateData.status)
})
```

#### 3. Get Pet by Status (GET)
```typescript
test(`GET All Pets By Status: ${status}`, async ({ request }) => {
    const response = await request.get(`/v2/pet/findByStatus?status=${status}`)

    expect(response.status()).toBe(200)
    
    // Zod schema validation - validates response structure and data types
    expect(() => GET_PetByStatusSchema.parse(response.json())).not.toThrow()
    
    const pets = await response.json()
    expect(Array.isArray(pets)).toBeTruthy()
    expect(pets.length).toBeGreaterThan(0)
})
```

#### 4. Delete Pet (DELETE)
```typescript
test(`DELETE Pet By ID: ${petId}`, async ({ request }) => {
    // Create pet first
    await request.post(`/v2/pet`, {
        data: createPetRequestBody(`Pet${petId}`, petId, 'available'),
    })

    // Delete the pet
    const deleteResponse = await request.delete(`/v2/pet/${petId}`)
    expect(deleteResponse.status()).toBe(200)

    // Verify deletion
    const getResponse = await request.get(`/v2/pet/${petId}`)
    expect(getResponse.status()).toBe(404)
})
```

### Negative Test Cases

#### 1. Invalid Request Body
```typescript
test(`POST Add New Pet - Invalid request body`, async ({ request }) => {
    const response = await request.post(`/v2/pet`, {
        data: '',
    })
    expect(response.status()).toBe(405)
})
```

#### 2. Non-existent Resource
```typescript
test(`GET Pet By ID - Non-existent pet`, async ({ request, utility }) => {
    const randomId = utility.getRandomNumber(10)
    const response = await request.get(`/v2/pet/${randomId}`)
    expect(response.status()).toBe(404)
})
```

## Test Data Management

### Data-Driven Testing with Factory Pattern
The framework uses a data factory pattern with `testData.ts` serving as the central data repository:

```typescript
// testData.ts acts as a data factory
export const createPetData = [
    { name: 'Fluffy', id: 123, status: 'available' },
    { name: 'Buddy', id: 456, status: 'pending' },
    { name: 'Max', id: 789, status: 'sold' },
]

// Parameterized tests consume factory data
createPetData.forEach(petData => {
    test(`Create Pet: ${petData.name}`, async ({ request }) => {
        const response = await request.post('/v2/pet', {
            data: createPetRequestBody(petData.name, petData.id, petData.status)
        })
        // Test implementation
    })
})
```

### Parameterized Request Bodies
The `validRequestBodies.ts` file provides parameterized factory functions:

```typescript
// Parameterized factory function
export function createPetRequestBody(name: string, id: number, status: string) {
    return {
        id,
        category: { id: 1, name: 'Dogs' },
        name,
        photoUrls: ['string'],
        tags: [{ id: 1, name: 'tag1' }],
        status,
    }
}

// Usage in tests with different parameters
test('Create multiple pets', async ({ request }) => {
    const pets = [
        { name: 'Rex', id: 100, status: 'available' },
        { name: 'Bella', id: 200, status: 'pending' }
    ]
    
    for (const pet of pets) {
        const response = await request.post('/v2/pet', {
            data: createPetRequestBody(pet.name, pet.id, pet.status)
        })
        expect(response.status()).toBe(200)
    }
})
```

### Schema Validation with Zod
Response validation using Zod schemas ensures data integrity:

```typescript
import { GET_PetByStatusSchema } from '../schemas/GET_PetByStatus'

test('Validate response schema', async ({ request }) => {
    const response = await request.get('/v2/pet/findByStatus?status=available')
    
    // This assertion validates:
    // - Response is an array
    // - Each pet has required fields (id, name, status, category, photoUrls)
    // - Field types match schema definition
    // - Status values are valid enums
    expect(() => GET_PetByStatusSchema.parse(response.json())).not.toThrow()
})
```

### Benefits of This Approach

1. **Data Factory Pattern**: 
   - Centralized test data management
   - Easy to maintain and update test datasets
   - Supports different test scenarios with minimal code duplication

2. **Parameterized Request Bodies**:
   - Reusable request builders
   - Type-safe parameter passing
   - Consistent request structure across tests

3. **Zod Schema Validation**:
   - Runtime type checking
   - Automatic validation of response structure
   - Clear error messages when validation fails
   - Ensures API contract compliance

### Test Data Categories

1. **Positive Test Data**: Valid data for successful operations
2. **Negative Test Data**: Invalid data for error scenarios
3. **Boundary Test Data**: Edge cases and limits
4. **Random Test Data**: Generated using utility functions

## Running Tests

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Playwright installed

### Installation
```powershell
npm i
npm install @playwright/test
npx playwright install
```

### Running All API Tests
```powershell
npx run ApiTests
```

### Running Specific Test Suite
```powershell
# Run only positive tests
npx playwright test API.spec.ts --grep "Positive Tests"

# Run only negative tests
npx playwright test API.spec.ts --grep "Negative Tests"
```

### Running with Different Configurations
```powershell
# Run in headed mode
npx playwright test API.spec.ts --headed

# Run with specific browser
npx playwright test API.spec.ts --project=chromium

# Run in debug mode
npx playwright test API.spec.ts --debug
```

### Parallel Execution
```powershell
# Run tests in parallel
npx playwright test API.spec.ts --workers=4
```

## Best Practices

### 1. Test Organization
- Use `test.describe.serial()` for dependent tests
- Group related tests in describe blocks
- Use meaningful test names with data parameters

### 2. Data Management
- Keep test data in separate files
- Use factory functions for request bodies
- Implement data cleanup after tests

### 3. Assertions and Validations
- **HTTP Status Codes**: Always validate expected status codes
- **Response Headers**: Check content-type and other relevant headers
- **Schema Validation**: Use Zod schemas for comprehensive response validation
- **Business Logic**: Verify response data matches expected business rules

```typescript
// Comprehensive validation example
test('Complete API validation', async ({ request }) => {
    const response = await request.get('/v2/pet/findByStatus?status=available')
    
    // Status code validation
    expect(response.status()).toBe(200)
    
    // Header validation
    expect(response.headers()['content-type']).toContain('application/json')
    
    // Schema validation with Zod
    expect(() => GET_PetByStatusSchema.parse(response.json())).not.toThrow()
    
    // Business logic validation
    const pets = await response.json()
    pets.forEach(pet => {
        expect(pet.status).toBe('available')
        expect(pet.id).toBeGreaterThan(0)
        expect(pet.name).toBeTruthy()
    })
})
```

### 4. Error Handling
```typescript
try {
    const response = await request.post('/api/endpoint', { data: payload })
    expect(response.status()).toBe(200)
} catch (error) {
    console.error('API call failed:', error)
    throw error
}
```

### 5. Request Configuration
```typescript
// Set custom headers
const response = await request.post('/api/endpoint', {
    data: payload,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
    }
})
```

## Advanced Features

### Zod Schema Validation Integration
Comprehensive response validation using Zod schemas:

```typescript
// Schema definition with strict typing
export const PetSchema = z.object({
    id: z.number().positive(),
    name: z.string().min(1),
    status: z.enum(['available', 'pending', 'sold']),
    category: z.object({
        id: z.number(),
        name: z.string()
    }),
    photoUrls: z.array(z.string().url()).min(1),
    tags: z.array(z.object({
        id: z.number(),
        name: z.string()
    })).optional()
})

// Usage in tests with detailed validation
test('Advanced schema validation', async ({ request }) => {
    const response = await request.get('/v2/pet/123')
    
    // Parse and validate response
    const validationResult = PetSchema.safeParse(await response.json())
    
    if (!validationResult.success) {
        console.log('Validation errors:', validationResult.error.issues)
        throw new Error('Schema validation failed')
    }
    
    // Type-safe access to validated data
    const pet = validationResult.data
    expect(pet.id).toBe(123)
})
```

### Data Factory with Builder Pattern
Advanced data factory implementation:

```typescript
// Enhanced data factory with builder pattern
class PetDataBuilder {
    private pet: any = {
        category: { id: 1, name: 'Dogs' },
        photoUrls: ['https://example.com/photo.jpg'],
        tags: [{ id: 1, name: 'tag1' }]
    }
    
    withId(id: number) {
        this.pet.id = id
        return this
    }
    
    withName(name: string) {
        this.pet.name = name
        return this
    }
    
    withStatus(status: 'available' | 'pending' | 'sold') {
        this.pet.status = status
        return this
    }
    
    build() {
        return { ...this.pet }
    }
}

// Usage in tests
test('Builder pattern for test data', async ({ request, utility }) => {
    const petData = new PetDataBuilder()
        .withId(utility.getRandomNumber(8))
        .withName(`TestPet_${utility.getRandomString(5)}`)
        .withStatus('available')
        .build()
    
    const response = await request.post('/v2/pet', { data: petData })
    expect(response.status()).toBe(200)
})
```

### Custom Fixtures Usage
```typescript
test('Advanced API test', async ({ request, utility }) => {
    const randomId = utility.getRandomNumber(8)
    const randomString = utility.getRandomString(10)
    
    // Use in API call
    const response = await request.post('/api/endpoint', {
        data: { id: randomId, name: randomString }
    })
})
```

### Environment Configuration
```typescript
// playwright.config.ts
export default defineConfig({
    use: {
        baseURL: process.env.API_BASE_URL || 'https://petstore.swagger.io',
        extraHTTPHeaders: {
            'Accept': 'application/json',
        }
    }
})
```

## Troubleshooting

### Common Issues

1. **Connection Timeouts**
   ```typescript
   // Increase timeout for slow APIs
   test.setTimeout(60000)
   ```

2. **Authentication Issues**
   ```typescript
   // Add authentication headers
   const response = await request.get('/protected-endpoint', {
       headers: { 'Authorization': 'Bearer your-token' }
   })
   ```

3. **Response Parsing Errors**
   ```typescript
   // Check content type before parsing
   if (response.headers()['content-type']?.includes('application/json')) {
       const body = await response.json()
   }
   ```

### Debugging Tips

1. **Log Request/Response Details**
   ```typescript
   console.log('Request URL:', response.url())
   console.log('Response Status:', response.status())
   console.log('Response Body:', await response.text())
   ```

2. **Use Playwright Inspector**
   ```bash
   npx playwright test --debug
   ```

3. **Generate Test Reports**
   ```bash
   npx playwright test --reporter=html
   ```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npx playwright test API.spec.ts
```

### Azure DevOps Pipeline
```yaml
# azure-pipelines.yml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: |
    npm ci
    npx playwright install
  displayName: 'Install dependencies'

- script: |
    npx playwright test API.spec.ts --reporter=junit
  displayName: 'Run API Tests'

- task: PublishTestResults@2
  inputs:
    testResultsFiles: 'results.xml'
  condition: succeededOrFailed()
```

## Reporting

### HTML Reports
```bash
# Generate HTML report
npx playwright test --reporter=html

# Open report
npx playwright show-report
```

### Allure Reports
```bash
# Install Allure
npm install -D allure-playwright

# Run tests with Allure
npx playwright test --reporter=allure-playwright

# Generate Allure report
allure serve allure-results
```

### Custom Reporting
```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results.xml' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
})
```

## Data Management Patterns

### Dynamic Test Data
```typescript
// Generate test data at runtime
const testPet = {
    id: utility.getRandomNumber(8),
    name: `Pet_${utility.getRandomString(5)}`,
    status: 'available'
}
```

### Test Data Cleanup
```typescript
// Cleanup after tests
test.afterEach(async ({ request }) => {
    // Clean up test data
    await request.delete(`/v2/pet/${testPetId}`)
})
```

### Configuration Management
```typescript
// Environment-specific configurations
const config = {
    dev: { baseURL: 'https://dev-api.example.com' },
    staging: { baseURL: 'https://staging-api.example.com' },
    prod: { baseURL: 'https://api.example.com' }
}
```

## Further Reading

- [Playwright API Testing Documentation](https://playwright.dev/docs/api-testing)
- [TypeScript Best Practices](https://typescript-eslint.io/)
- [REST API Testing Guidelines](https://restfulapi.net/)
- [HTTP Status Codes Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

This API testing framework provides a solid foundation for comprehensive REST API testing with Playwright. The combination of TypeScript, data-driven testing, and Playwright's robust request capabilities ensures reliable and maintainable API test automation.
