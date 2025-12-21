# TimeTracker v1 — Testing Strategy

**Purpose:** Define automated tests for business logic (non-UI) to enable self-verification

---

## Test Layers

### 1. Unit Tests (Business Logic)
**What:** Pure functions with no UI dependencies  
**Tool:** Vitest (fast, Vite-native)  
**Coverage:** Calculations, date utilities, validation logic

### 2. Integration Tests (IndexedDB)
**What:** Database operations  
**Tool:** Vitest with fake-indexeddb  
**Coverage:** CRUD operations, schema migrations, queries

### 3. E2E Tests (Full App)
**What:** User workflows  
**Tool:** Playwright (already installed)  
**Coverage:** Critical paths, PWA installation, offline behavior

---

## Unit Test Targets (Priority Order)

### High Priority (Must Have)
These are pure business logic from `ui-logic-spec-v1.md` Section 10:

#### 1. Calculation Logic (`src/lib/utils/calculations.ts`)
```typescript
// Test: calculateDuration(startTime, endTime)
✓ "08:00" to "12:00" = 4.0
✓ "08:30" to "12:45" = 4.25
✓ "23:00" to "01:00" = 2.0 (crosses midnight)
✓ null endTime = 0 (running task)

// Test: calculateIst(entries, categories)
✓ Sum only entries where category.countsAsWorkTime === true
✓ Exclude entries with endTime === null
✓ Empty entries = 0
✓ Multiple entries with mixed categories

// Test: calculateSoll(date, dayType, model)
✓ Arbeitstag + Monday model = model.monday
✓ Urlaub = 0 (regardless of model)
✓ Krank = 0
✓ Feiertag = 0
✓ No model for date = 0

// Test: calculateSaldo(ist, soll)
✓ Ist > Soll = positive
✓ Ist < Soll = negative
✓ Ist === Soll = 0
```

#### 2. Date Utilities (`src/lib/utils/date.ts`)
```typescript
// Test: formatDate(date, format)
✓ Date to "DD.MM.YYYY"
✓ Date to "YYYY-MM-DD"
✓ Handle timezone correctly

// Test: parseDate(str)
✓ "21.12.2025" to Date
✓ "2025-12-21" to Date
✓ Invalid string = null or error

// Test: getWeekBounds(date)
✓ Returns {start: Monday, end: Sunday}
✓ ISO week (week starts Monday)
✓ Year boundary handling

// Test: getDayOfWeek(date)
✓ Monday = "monday"
✓ Sunday = "sunday"

// Test: isToday(date)
✓ Today = true
✓ Yesterday = false
✓ Tomorrow = false

// Test: getCurrentWeekNumber(date)
✓ ISO week number
✓ Week 1 definition correct
```

#### 3. Validation Logic (`src/lib/utils/validation.ts`)
```typescript
// Test: validateDate(str)
✓ Valid DD.MM.YYYY = true
✓ Invalid format = false
✓ Invalid date (32.13.2025) = false

// Test: validateTime(str)
✓ Valid HH:mm = true
✓ Invalid format = false
✓ Invalid time (25:00) = false

// Test: validateTimeRange(start, end)
✓ end > start = true
✓ end < start = false
✓ end === start = false (or true, depending on spec)

// Test: validateHours(value)
✓ Positive number = true
✓ 0-24 range = true
✓ Negative = false
✓ > 24 = false (or true, depending on spec)
```

### Medium Priority (Should Have)

#### 4. Analysis Grouping (`src/lib/utils/analysis.ts`)
```typescript
// Test: groupByPeriod(entries, dayTypes, range)
✓ Range ≤ 60 days = group by week
✓ Range > 60 days = group by month
✓ Include current incomplete period
✓ Correct Ist/Soll per period
```

### Low Priority (Nice to Have)

#### 5. IndexedDB Operations (`src/lib/db/operations.ts`)
```typescript
// Test with fake-indexeddb
✓ getAll() returns all records
✓ getById() returns correct record
✓ put() creates/updates record
✓ delete() removes record
✓ Transactions commit/rollback correctly
```

---

## Test Setup

### Install Vitest
```bash
npm install -D vitest @vitest/ui
```

### Update package.json
```json
{
  "scripts": {
    "test:unit": "vitest",
    "test:unit:ui": "vitest --ui",
    "test:unit:run": "vitest run",
    "test": "npm run test:unit:run && npm run test:e2e"
  }
}
```

### Create vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    globals: true,
    environment: 'jsdom'
  }
});
```

---

## Test File Structure

```
src/
├── lib/
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── calculations.test.ts       ← Unit tests
│   │   ├── date.ts
│   │   ├── date.test.ts               ← Unit tests
│   │   ├── validation.ts
│   │   └── validation.test.test.ts    ← Unit tests
│   └── db/
│       ├── operations.ts
│       └── operations.test.ts         ← Integration tests
└── ...
```

---

## Example Test File

**`src/lib/utils/calculations.test.ts`:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateDuration, calculateIst, calculateSoll, calculateSaldo } from './calculations';

describe('calculateDuration', () => {
  it('should calculate hours between two times', () => {
    expect(calculateDuration('08:00', '12:00')).toBe(4.0);
    expect(calculateDuration('08:30', '12:45')).toBe(4.25);
  });

  it('should handle midnight crossing', () => {
    expect(calculateDuration('23:00', '01:00')).toBe(2.0);
  });

  it('should return 0 for null endTime', () => {
    expect(calculateDuration('08:00', null)).toBe(0);
  });
});

describe('calculateIst', () => {
  it('should sum only work time entries', () => {
    const entries = [
      { id: '1', startTime: '08:00', endTime: '12:00', categoryId: 'work' },
      { id: '2', startTime: '12:00', endTime: '12:30', categoryId: 'pause' }
    ];
    const categories = [
      { id: 'work', countsAsWorkTime: true },
      { id: 'pause', countsAsWorkTime: false }
    ];
    expect(calculateIst(entries, categories)).toBe(4.0);
  });

  it('should exclude running tasks', () => {
    const entries = [
      { id: '1', startTime: '08:00', endTime: '12:00', categoryId: 'work' },
      { id: '2', startTime: '13:00', endTime: null, categoryId: 'work' }
    ];
    const categories = [
      { id: 'work', countsAsWorkTime: true }
    ];
    expect(calculateIst(entries, categories)).toBe(4.0);
  });
});

describe('calculateSoll', () => {
  it('should return model hours for Arbeitstag', () => {
    const date = new Date('2025-12-22'); // Monday
    const dayType = { type: 'arbeitstag' };
    const model = { monday: 8.0, tuesday: 8.0, /* ... */ };
    expect(calculateSoll(date, dayType, model)).toBe(8.0);
  });

  it('should return 0 for Urlaub', () => {
    const date = new Date('2025-12-22');
    const dayType = { type: 'urlaub' };
    const model = { monday: 8.0, /* ... */ };
    expect(calculateSoll(date, dayType, model)).toBe(0);
  });
});

describe('calculateSaldo', () => {
  it('should calculate balance correctly', () => {
    expect(calculateSaldo(8.0, 8.0)).toBe(0);
    expect(calculateSaldo(10.0, 8.0)).toBe(2.0);
    expect(calculateSaldo(6.0, 8.0)).toBe(-2.0);
  });
});
```

---

## Verification Workflow

### After Implementing Each Utility Module:

1. **Write tests first** (TDD approach) or immediately after
2. **Run tests:** `npm run test:unit`
3. **Verify coverage:** All critical paths tested
4. **Update progress:** Mark in `IMPLEMENTATION_PROGRESS.md`

### Before Marking Task Complete:

```bash
npm run check        # TypeScript
npm run lint         # Code style
npm run test:unit    # Unit tests
npm run test:e2e     # E2E tests (if applicable)
```

All must pass ✅

---

## Spec Compliance Tests

### Create Spec Verification Script

**`scripts/verify-spec-compliance.ts`:**
```typescript
// Automated checks against ui-logic-spec-v1.md
// Example: Verify calculation formulas match spec Section 10

import { calculateIst, calculateSoll, calculateSaldo } from '../src/lib/utils/calculations';

// Test cases from spec
const specTests = [
  {
    name: 'Ist calculation matches spec §10',
    test: () => {
      // Spec: "Summe aller Aufgaben mit Kategorie.zähltAlsArbeitszeit === true"
      // Test implementation matches this exactly
    }
  },
  {
    name: 'Soll calculation matches spec §10',
    test: () => {
      // Spec: "wenn Tagesart === Arbeitstag: Soll = Arbeitszeitmodell[Wochentag]"
      // Test implementation matches this exactly
    }
  }
];

// Run all spec compliance tests
specTests.forEach(test => {
  console.log(`Testing: ${test.name}`);
  test.test();
});
```

---

## Integration with Task Breakdown

### Updated Task Requirements

Every task that creates business logic MUST include:
1. Implementation
2. Unit tests
3. Verification: `npm run test:unit` passes

**Example:**
```markdown
### Task 2.4 — Create calculation utility functions
- **Files:**
  - `src/lib/utils/calculations.ts` (implementation)
  - `src/lib/utils/calculations.test.ts` (tests)
- **Done when:**
  - All 4 functions implemented
  - Unit tests cover all cases from spec §10
  - All tests pass
- **Verify:**
  - `npm run check` ✅
  - `npm run test:unit` ✅
```

---

## Benefits of This Approach

✅ **Self-verification:** Tests prove logic matches spec  
✅ **Regression prevention:** Changes don't break existing logic  
✅ **Documentation:** Tests show how functions should behave  
✅ **Confidence:** Can refactor safely  
✅ **Fast feedback:** Unit tests run in milliseconds  

---

**Next Step:** Install Vitest and create test setup before starting implementation.
