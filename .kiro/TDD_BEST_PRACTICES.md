# Test-Driven Development (TDD) Best Practices

## Core Principle

**ALWAYS write tests BEFORE implementation code.**

## TDD Workflow (Red-Green-Refactor)

### 1. RED - Write a Failing Test
```typescript
// users.spec.ts
describe("getAllUsers", () => {
  it("should return all users with profiles", async () => {
    const result = await getAllUsers();
    
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
  });
});
```

### 2. GREEN - Write Minimal Code to Pass
```typescript
// users.ts
export async function getAllUsers() {
  return {
    success: true,
    data: [],
    error: null,
  };
}
```

### 3. REFACTOR - Improve Code Quality
```typescript
// users.ts
export async function getAllUsers() {
  const supabase = await supabaseServer();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*");
    
  if (error) {
    return { success: false, error: error.message, data: null };
  }
  
  return { success: true, data, error: null };
}
```

## File Naming Convention

```
src/
├── lib/
│   ├── actions/
│   │   ├── users.spec.ts      ← Write this FIRST
│   │   ├── users.ts           ← Write this SECOND
│   │   ├── catalogues.spec.ts ← Write this FIRST
│   │   └── catalogues.ts      ← Write this SECOND
```

## Test Structure

### 1. Arrange-Act-Assert (AAA) Pattern

```typescript
it("should update user successfully", async () => {
  // ARRANGE - Set up test data
  const input = {
    id: "test-id",
    full_name: "John Doe",
  };
  
  // ACT - Execute the function
  const result = await updateUser(input);
  
  // ASSERT - Verify the outcome
  expect(result.success).toBe(true);
  expect(result.data?.full_name).toBe("John Doe");
});
```

### 2. Test Categories

#### Unit Tests
Test individual functions in isolation:
```typescript
describe("calculateTotal", () => {
  it("should sum array of numbers", () => {
    expect(calculateTotal([1, 2, 3])).toBe(6);
  });
});
```

#### Integration Tests
Test multiple components working together:
```typescript
describe("User Management Integration", () => {
  it("should create and retrieve user", async () => {
    const created = await createUser({ name: "John" });
    const retrieved = await getUserById(created.data.id);
    
    expect(retrieved.data.name).toBe("John");
  });
});
```

#### Property-Based Tests
Test universal properties that should always hold:
```typescript
describe("Property Tests", () => {
  it("should maintain total count after role change", async () => {
    const before = await getUserStats();
    await promoteToAdmin("user-id");
    const after = await getUserStats();
    
    expect(after.data.total).toBe(before.data.total);
  });
});
```

#### Edge Case Tests
Test boundary conditions and unusual inputs:
```typescript
describe("Edge Cases", () => {
  it("should handle empty array", () => {
    expect(calculateTotal([])).toBe(0);
  });
  
  it("should handle null values", () => {
    expect(formatName(null)).toBe("");
  });
});
```

## Test Coverage Goals

- **Critical Paths**: 100% coverage
- **Business Logic**: 90%+ coverage
- **UI Components**: 70%+ coverage
- **Utilities**: 80%+ coverage

## What to Test

### ✅ DO Test:
- Business logic
- Data transformations
- Error handling
- Edge cases
- Integration points
- Security validations
- Database operations
- API responses

### ❌ DON'T Test:
- Third-party libraries
- Framework internals
- Trivial getters/setters
- Auto-generated code
- Configuration files

## Test Organization

### Group Related Tests
```typescript
describe("User Management", () => {
  describe("getAllUsers", () => {
    it("should return all users", async () => {});
    it("should handle errors", async () => {});
  });
  
  describe("updateUser", () => {
    it("should update successfully", async () => {});
    it("should validate input", async () => {});
  });
});
```

### Use Descriptive Names
```typescript
// ❌ Bad
it("works", () => {});

// ✅ Good
it("should return error when user ID is invalid", () => {});
```

### One Assertion Per Test (When Possible)
```typescript
// ❌ Bad - Testing multiple things
it("should handle user operations", async () => {
  expect(await createUser()).toBeTruthy();
  expect(await updateUser()).toBeTruthy();
  expect(await deleteUser()).toBeTruthy();
});

// ✅ Good - Separate tests
it("should create user successfully", async () => {
  expect(await createUser()).toBeTruthy();
});

it("should update user successfully", async () => {
  expect(await updateUser()).toBeTruthy();
});
```

## Mocking Best Practices

### Mock External Dependencies
```typescript
vi.mock("@/lib/supabase/server", () => ({
  supabaseServer: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: mockData,
        error: null,
      })),
    })),
  })),
}));
```

### Don't Mock What You're Testing
```typescript
// ❌ Bad - Mocking the function under test
vi.mock("./users", () => ({
  getAllUsers: vi.fn(() => ({ success: true })),
}));

// ✅ Good - Mock dependencies only
vi.mock("@/lib/supabase/server");
```

## Test Data Management

### Use Factories for Test Data
```typescript
function createMockUser(overrides = {}) {
  return {
    id: "test-id",
    full_name: "Test User",
    role: "customer",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

it("should handle admin users", () => {
  const admin = createMockUser({ role: "admin" });
  expect(isAdmin(admin)).toBe(true);
});
```

### Clean Up After Tests
```typescript
describe("Database Tests", () => {
  afterEach(async () => {
    // Clean up test data
    await deleteTestUsers();
  });
});
```

## Common Patterns

### Testing Async Functions
```typescript
it("should fetch data asynchronously", async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

### Testing Error Handling
```typescript
it("should handle database errors", async () => {
  // Mock error
  vi.mocked(supabase.from).mockRejectedValue(new Error("DB Error"));
  
  const result = await getAllUsers();
  
  expect(result.success).toBe(false);
  expect(result.error).toContain("DB Error");
});
```

### Testing Validation
```typescript
it("should reject invalid email", () => {
  const result = validateEmail("invalid-email");
  expect(result.isValid).toBe(false);
  expect(result.error).toBe("Invalid email format");
});
```

## Performance Testing

### Test Response Times
```typescript
it("should complete within 2 seconds", async () => {
  const start = Date.now();
  await getAllUsers();
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(2000);
});
```

## Security Testing

### Test Authorization
```typescript
it("should prevent non-admin from deleting users", async () => {
  // Mock non-admin user
  vi.mocked(getCurrentUser).mockResolvedValue({ role: "customer" });
  
  const result = await deleteUser("user-id");
  
  expect(result.success).toBe(false);
  expect(result.error).toContain("permission");
});
```

### Test Input Sanitization
```typescript
it("should sanitize SQL injection attempts", () => {
  const malicious = "'; DROP TABLE users; --";
  const result = sanitizeInput(malicious);
  
  expect(result).not.toContain("DROP TABLE");
});
```

## Documentation in Tests

### Use Comments for Complex Logic
```typescript
it("should calculate discount correctly", () => {
  // Given: A product with 20% discount
  const product = { price: 100, discount: 0.2 };
  
  // When: Calculating final price
  const final = calculatePrice(product);
  
  // Then: Should apply discount correctly
  expect(final).toBe(80);
});
```

### Link Tests to Requirements
```typescript
it("should prevent last admin deletion", async () => {
  // Validates Requirement 9.1: System must prevent deletion of last admin
  const result = await deleteUser("last-admin-id");
  
  expect(result.success).toBe(false);
  expect(result.error).toContain("last admin");
});
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test users.spec.ts
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Continuous Integration

### Pre-commit Hook
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

### CI Pipeline
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
```

## Benefits of TDD

1. **Better Design**: Writing tests first forces you to think about API design
2. **Documentation**: Tests serve as living documentation
3. **Confidence**: Refactor with confidence knowing tests will catch regressions
4. **Debugging**: Failing tests pinpoint exactly what broke
5. **Coverage**: Ensures all code paths are tested
6. **Quality**: Catches bugs early in development

## Common Mistakes to Avoid

### ❌ Writing Tests After Implementation
```typescript
// Wrong order:
// 1. Write users.ts
// 2. Write users.spec.ts

// Correct order:
// 1. Write users.spec.ts
// 2. Write users.ts
```

### ❌ Testing Implementation Details
```typescript
// ❌ Bad - Testing internal state
expect(component.state.isLoading).toBe(true);

// ✅ Good - Testing behavior
expect(screen.getByText("Loading...")).toBeInTheDocument();
```

### ❌ Overly Complex Tests
```typescript
// ❌ Bad - Too much setup
it("should work", async () => {
  const user = await createUser();
  const profile = await createProfile(user);
  const settings = await createSettings(profile);
  // ... 20 more lines
});

// ✅ Good - Use test helpers
it("should work", async () => {
  const { user, profile, settings } = await setupTestUser();
  // Test logic
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Test-Driven Development by Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

---

**Remember:** Tests are not just about catching bugs—they're about designing better software!

**Golden Rule:** If you can't test it, you can't trust it.
