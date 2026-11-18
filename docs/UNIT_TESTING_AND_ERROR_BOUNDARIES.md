# TIME-MATE: Granular Technical Documentation on Unit Testing & Error Boundaries

This document provides in-depth technical documentation detailing the **Unit Testing Architecture** and **Error Boundary Containment Systems** implemented across the frontend and backend of **Time-Mate**.

---

## 1. Unit Testing Architecture

### 1.1 Philosophy & Design Principles
The testing framework for Time-Mate follows the **Test Pyramid** strategy with high test execution speed, zero third-party dependency bloat, and maximum deterministic reliability:
1. **Zero External Test Runner Overhead:** Uses Node.js native test runner (`node:test`) and strict assertion library (`node:assert/strict`) integrated with TypeScript compilation via `tsx`.
2. **Deterministic Assertions:** All test assertions evaluate isolated mathematical, cryptographic, or logical invariants without relying on non-deterministic external network calls.
3. **Boundary Condition Coverage:** Specific test cases target edge cases such as token expiration, short passwords, invalid formats, unmounted React states, and empty sets.

---

### 1.2 Test Execution Commands

#### Running Backend Unit Tests:
```bash
cd backend
npm test
```
*Output: 15 passing tests across 3 test suites (~300ms execution).*

#### Running Frontend Unit Tests:
```bash
cd frontend
npm test
```
*Output: 11 passing tests across 3 test suites (~190ms execution).*

#### Combined Automated Verification:
```bash
(cd backend && npm test) && (cd frontend && npm test)
```
*Result: 26 total automated tests passing (100% pass rate).*

---

### 1.3 Test Suites Breakdown

#### Backend Test Suites (`backend/src/tests/`):

| Test Suite File | Test Cases Included | Verified Invariants |
| :--- | :--- | :--- |
| **`auth.test.ts`** | 1. Bcrypt password hashing & work factor<br>2. Plaintext vs hash security<br>3. JWT signing & claims validation<br>4. Tampered token rejection<br>5. Expired token rejection<br>6. Minimum password length check (>= 6 chars) | Cryptographic security, salt rounds, token claims, expiration timestamps. |
| **`errorHandling.test.ts`** | 1. Custom `AppError` instantiation & metadata<br>2. Default status code fallback (500)<br>3. 404 Route Not Found envelope formatting<br>4. SQLite unique constraint mapping (HTTP 409)<br>5. JWT token expiration mapping (HTTP 401) | Status code mapping, error message cleanliness, standardized response envelopes. |
| **`taskController.test.ts`** | 1. Priority levels validation (`HIGH`, `MEDIUM`, `LOW`)<br>2. Allowed task categories validation<br>3. SQLite numeric boolean conversion (0/1 to boolean)<br>4. Rescheduling date calculation (+1 day tomorrow)<br>5. Mandatory field validations (title, due date) | Data integrity, sanitization, default priority fallback, date calculations. |

#### Frontend Test Suites (`frontend/src/tests/`):

| Test Suite File | Test Cases Included | Verified Invariants |
| :--- | :--- | :--- |
| **`errorBoundary.test.ts`** | 1. Initial non-error state initialization<br>2. `getDerivedStateFromError` state transition<br>3. `componentDidCatch` stack trace retention<br>4. State recovery via `handleReset` | React lifecycle hooks, error state toggling, stack trace persistence, view re-mount. |
| **`taskLogic.test.ts`** | 1. Single-day task filtering (e.g. today's tasks)<br>2. Active vs completed task segmentation<br>3. Priority-based sorting (`HIGH` > `MEDIUM` > `LOW`)<br>4. Immutability during task rescheduling | Client-side list filtering, sorting weights, state immutability. |
| **`productivityMetrics.test.ts`** | 1. Percentage calculation with zero total edge case<br>2. Pomodoro focus duration aggregation to hours & minutes<br>3. Phone distraction severity classification | Mathematical accuracy, string formatting, behavioral analytics tiers. |

---

## 2. Error Boundaries & Error Containment Systems

### 2.1 Frontend: Dual-Layer React Error Boundaries

In React 18, uncaught errors during rendering, in lifecycle methods, or in child component constructors unmount the entire component tree, causing a blank white screen. 

Time-Mate implements a **Dual-Layer Error Boundary** architecture via `frontend/src/components/ErrorBoundary.tsx`:

```
                +------------------------------------+
                |  Layer 1: Root App Error Boundary  |
                +-----------------+------------------+
                                  |
                   +--------------v--------------+
                   |  Global Providers (Auth/App)|
                   +--------------+--------------+
                                  |
         +------------------------+------------------------+
         |                                                 |
+--------v-------+                                +--------v-------+
|  Top Navbar    |                                |  Left Sidebar  |
+----------------+                                +----------------+
         |                                                 |
         +------------------------+------------------------+
                                  |
                +-----------------v------------------+
                |  Layer 2: View Area Error Boundary |
                +-----------------+------------------+
                                  |
                +-----------------v------------------+
                |  Active Page (Tasks/Focus/Planner) |
                +------------------------------------+
```

#### Key Architecture Benefits:
1. **Fault Isolation:** An uncaught rendering error in a complex sub-view (such as the 7-day canvas bar chart in `ProgressPage` or the Pomodoro timer in `FocusTimerPage`) is trapped by **Layer 2**.
2. **Persistent Navigation:** The student does not lose application access. The Top Navbar and Left Sidebar remain fully interactive, allowing the student to click to another view (e.g., Daily Planner) without reloading.
3. **Self-Healing Recovery:** The fallback UI contains a *"Try Again & Reload View"* action that calls `handleReset()`, resetting `hasError: false` and clearing error references to re-mount the component.
4. **Developer Diagnostics:** An expandable *"Technical Diagnostics & Stack Trace"* drawer renders the exact error message, component stack hierarchy, and JavaScript call stack for instant debugging.

#### Implementation Code Extract (`ErrorBoundary.tsx`):
```typescript
export class ErrorBoundary extends Component<Props, State> {
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('🚨 [ErrorBoundary] Uncaught exception caught:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    if (this.props.onReset) this.props.onReset();
  };
  // ...
}
```

---

### 2.2 Backend: Centralized Error Handling Pipeline

The backend server (`backend/src/server.ts`) implements a centralized error handling architecture managed by `backend/src/middleware/errorHandler.ts`.

#### Operational vs. Programmer Errors
* **Operational Errors (`AppError`):** Known failure states (e.g., 400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict). Handled gracefully with explicit user-friendly messages and no internal stack leak.
* **Programmer Errors:** Unanticipated bugs (e.g., SQLite connection loss, null pointer dereferences). Logged with full stack traces to the server terminal, returning a generic 500 status code to the client.

#### Centralized Error Translation Pipeline:
```typescript
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error occurred.';

  // SQLite Unique Constraint (Duplicate Email, etc.)
  if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    statusCode = 409;
    message = 'Database constraint violation. Duplicate resource or unique constraint failed.';
  }

  // SQLite Foreign Key Failure
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    statusCode = 400;
    message = 'Foreign key constraint failed. Referenced resource does not exist.';
  }

  // JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token provided.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please sign in again.';
  }

  // Malformed JSON Payload
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body.';
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};
```

#### 404 Route Not Found Middleware:
Unmatched routes are captured prior to the error handler:
```typescript
export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    error: `Resource not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
};
```
