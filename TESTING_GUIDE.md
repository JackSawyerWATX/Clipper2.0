# Testing Framework Setup Guide

## Overview

Your project now has a complete testing setup with:

- **Frontend**: Vitest + React Testing Library
- **Backend**: Jest + Supertest

## Running Tests

### Frontend Tests
```bash
npm test              # Run tests once
npm test -- --watch  # Watch mode (re-run on file changes)
npm run test:ui      # Run with visual UI dashboard
```

### Backend Tests
```bash
cd server
npm test             # Run tests once
npm run test:watch  # Watch mode
```

## Test Locations

### Frontend Tests
- `src/__tests__/` - Test files for React components and utilities
- `src/test/setup.js` - Test configuration and globals

### Backend Tests
- `server/routes/__tests__/` - API route tests
- `server/test/setup.js` - Test configuration
- `server/jest.config.js` - Jest configuration

## Example Tests Included

### Frontend (src/__tests__/basic.test.js)
- Math operations (add, subtract, multiply)
- Array operations (filter, length, contains)
- String operations (concatenation, includes)

### Backend (server/routes/__tests__/api.test.js)
- Health check endpoint
- HTTP status codes
- Response content types
- 404 error handling

## Configuration Files

### Frontend: vitest.config.js
- Uses jsdom environment (browser-like)
- Includes setup file for mocks
- Coverage reporting enabled

### Backend: jest.config.js
- Uses node environment
- Detects open handles (good for finding resource leaks)
- Collects coverage from routes, config, middleware

## Writing Your Own Tests

### Frontend Test Example
```javascript
import { describe, it, expect } from 'vitest'

describe('My Component', () => {
  it('should do something', () => {
    expect(2 + 2).toBe(4)
  })
})
```

### Backend Test Example
```javascript
const request = require('supertest')
const app = require('../server')

describe('My API', () => {
  it('should return data', async () => {
    const response = await request(app).get('/api/my-endpoint')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('data')
  })
})
```

## CI/CD Integration

Tests now run automatically in CodePipeline:

1. **Pre-build phase**: Frontend and backend tests run
2. **Tests can fail, but build continues** (non-blocking)
3. **Build phase**: React frontend is built and deployed

If you want tests to **block deployment** on failure, update `buildspec.yml`:

```yaml
- npm test -- run  # Remove "2>/dev/null || echo..." to block on failure
- cd server && npm test
```

## Common Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- basic.test.js

# Update snapshots (if using visual snapshots)
npm test -- -u

# Run with coverage report
npm test -- --coverage

# Backend specific
cd server
npm test              # Run once
npm run test:watch   # Watch mode
npm test -- --verbose
```

## Adding More Tests

For every React component you create, add a corresponding test:
- Component: `src/pages/MyPage.jsx`
- Test: `src/__tests__/MyPage.test.js`

For every API route you create, add a corresponding test:
- Route: `server/routes/myroute.js`
- Test: `server/routes/__tests__/myroute.test.js`

## Testing Best Practices

1. **One assertion per test** (when possible)
2. **Descriptive test names** - "should return 200 on valid input"
3. **Setup and teardown** - Use `beforeEach`, `afterEach`
4. **Mock external dependencies** - Database, APIs, etc.
5. **Test behavior, not implementation** - Focus on what the code does, not how

## Next Steps

1. Write tests for existing components/routes
2. Achieve 80%+ code coverage
3. Make tests **required to pass before deployment** (optional)

## Troubleshooting

### "Cannot find module" errors
- Make sure you're running tests from the correct directory
- Frontend: `npm test` from root
- Backend: `npm test` from `server/` directory

### Tests hang/don't complete
- Check for missing async/await
- Ensure database connections close properly
- Use `--detectOpenHandles` flag (already enabled)

### Want to skip a test temporarily?
```javascript
it.skip('should do something', () => { ... })
// or
describe.skip('Group of tests', () => { ... })
```

## Resources

- Vitest Docs: https://vitest.dev/
- Jest Docs: https://jestjs.io/
- React Testing Library: https://testing-library.com/react
- Supertest: https://github.com/visionmedia/supertest
