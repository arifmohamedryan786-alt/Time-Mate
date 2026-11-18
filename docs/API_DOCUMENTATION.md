# TIME-MATE: REST API Specification & Technical Documentation

This document provides a comprehensive, production-grade specification of all RESTful API endpoints available in the **Time-Mate** hostel student productivity platform.

---

## 1. Architectural Overview & Conventions

* **Base URL:** `/api` (or `http://localhost:5001/api` in local development)
* **Transport:** HTTP / 1.1 or HTTP / 2 over TLS
* **Content Negotiation:** `application/json` (both request bodies and responses)
* **Standard Date Format:** ISO 8601 extended calendar date (`YYYY-MM-DD`, e.g., `2026-11-18`)
* **Standard Time Format:** 24-hour military notation (`HH:MM`, e.g., `09:30`, `23:59`)
* **Authentication Scheme:** Bearer Token via HTTP `Authorization` Header (`Authorization: Bearer <jwt-token>`)

---

## 2. Global Error Envelope Specification

All non-2xx responses returned by the Time-Mate API conform to a deterministic, structured error envelope:

```json
{
  "success": false,
  "error": "Human-readable description of what failed.",
  "details": {
    "field": "optional diagnostic details"
  },
  "timestamp": "2026-11-18T10:53:00.000Z"
}
```

### Standard HTTP Status Codes

| HTTP Status | Semantics | Typical Trigger Scenario |
| :--- | :--- | :--- |
| **`200 OK`** | Request succeeded | Successful GET, PUT, or DELETE request. |
| **`201 Created`** | Resource successfully created | Successful POST creating user, task, schedule, focus session, or reflection. |
| **`400 Bad Request`** | Client input validation error | Missing mandatory field, invalid date/time format, or password mismatch. |
| **`401 Unauthorized`** | Missing or invalid authentication token | Request without `Authorization` header or with expired token. |
| **`403 Forbidden`** | Signature mismatch or malformed token | Tampered JWT token or invalid cryptographic signature. |
| **`404 Not Found`** | Target entity does not exist | Task ID or Schedule ID not found or not owned by student. |
| **`409 Conflict`** | Database constraint violation | Attempting to sign up with an email address that already exists. |
| **`500 Internal Error`** | Uncaught server exception | Unexpected database connection failure or server error. |

---

## 3. Endpoints Directory

```
Authentication:
  POST   /api/auth/signup            - Create new student account
  POST   /api/auth/login             - Authenticate credentials and retrieve JWT
  POST   /api/auth/logout            - Invalidate local session
  GET    /api/auth/me                - Fetch profile of logged-in student
  PUT    /api/auth/change-password   - Update password with current password verification

Tasks:
  GET    /api/tasks                  - List all tasks for current student
  POST   /api/tasks                  - Create a new prioritized task
  PUT    /api/tasks/:id              - Update or reschedule a task
  DELETE /api/tasks/:id              - Delete a task

Schedules:
  GET    /api/schedules              - Retrieve timeline blocks (optional ?date=YYYY-MM-DD)
  POST   /api/schedules              - Add daily timeline block
  PUT    /api/schedules/:id          - Update timeline block
  DELETE /api/schedules/:id          - Remove timeline block

Focus Sessions:
  GET    /api/focus-sessions         - List completed Pomodoro focus intervals
  POST   /api/focus-sessions         - Log completed focus session

Daily Reflections:
  GET    /api/reflections            - List daily phone distraction self-reports
  POST   /api/reflections            - Upsert daily reflection for today

User Settings:
  GET    /api/settings               - Fetch student routine preferences
  PUT    /api/settings               - Update routine preferences
```

---

## 4. Detailed Endpoint Specifications

### 4.1 Authentication Endpoints

#### `POST /api/auth/signup`
Creates a new student account, initializes default hostel routine preferences, and returns an authenticated JWT token.

* **Authentication:** Public (No token required)
* **Request Body:**
  ```json
  {
    "name": "Alex Chen",
    "email": "alex.student@hostel.edu",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
* **Validation Rules:**
  - `name`: String, required, trimmed.
  - `email`: String, required, valid email format, must be unique.
  - `password`: String, required, minimum length 6 characters.
  - `confirmPassword`: String, required, must strictly equal `password`.
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Account created successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_1731908400000_abc12",
      "name": "Alex Chen",
      "email": "alex.student@hostel.edu"
    }
  }
  ```
* **Error Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "error": "Passwords do not match. Please verify both password entries."
  }
  ```

---

#### `POST /api/auth/login`
Validates student credentials and returns a signed 7-day JWT token.

* **Authentication:** Public (No token required)
* **Request Body:**
  ```json
  {
    "email": "alex.student@hostel.edu",
    "password": "password123"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Signed in successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "demo-user-123",
      "name": "Alex Chen",
      "email": "alex.student@hostel.edu"
    }
  }
  ```
* **Error Response (`401 Unauthorized`):**
  ```json
  {
    "success": false,
    "error": "Invalid email address or password."
  }
  ```

---

#### `GET /api/auth/me`
Retrieves identity profile information for the authenticated token.

* **Authentication:** Protected (`Authorization: Bearer <token>`)
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "user": {
      "id": "demo-user-123",
      "name": "Alex Chen",
      "email": "alex.student@hostel.edu",
      "created_at": "2026-11-18 08:00:00"
    }
  }
  ```

---

### 4.2 Task Management Endpoints

#### `GET /api/tasks`
Retrieves all prioritized tasks belonging to the authenticated student, sorted chronologically.

* **Authentication:** Protected (`Authorization: Bearer <token>`)
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "tasks": [
      {
        "id": "task-1",
        "user_id": "demo-user-123",
        "title": "Complete Data Structures Assignment",
        "description": "Implement AVL Tree balancing and test search operations",
        "category": "Assignment",
        "priority": "HIGH",
        "due_date": "2026-11-18",
        "due_time": "18:00",
        "notes": "Check textbook chapter 5 for reference",
        "completed": true,
        "created_at": "2026-11-18 08:00:00",
        "updated_at": "2026-11-18 08:00:00"
      }
    ]
  }
  ```

---

#### `POST /api/tasks`
Creates a new task.

* **Authentication:** Protected (`Authorization: Bearer <token>`)
* **Request Body:**
  ```json
  {
    "title": "Review Engineering Physics Lab",
    "description": "Prepare circuit diagrams for Wheatstone bridge",
    "category": "Study",
    "priority": "HIGH",
    "due_date": "2026-11-19",
    "due_time": "20:00",
    "notes": "Bring lab notebook"
  }
  ```
* **Validation Rules:**
  - `title`: String, required.
  - `due_date`: String (`YYYY-MM-DD`), required.
  - `priority`: Enum [`HIGH`, `MEDIUM`, `LOW`] (Default: `MEDIUM`).
  - `category`: Enum [`Study`, `Assignment`, `Class`, `Personal`, `Project`, `Other`] (Default: `Study`).
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Task created successfully.",
    "task": {
      "id": "tsk_1731908500000_xyz89",
      "user_id": "demo-user-123",
      "title": "Review Engineering Physics Lab",
      "description": "Prepare circuit diagrams for Wheatstone bridge",
      "category": "Study",
      "priority": "HIGH",
      "due_date": "2026-11-19",
      "due_time": "20:00",
      "notes": "Bring lab notebook",
      "completed": false,
      "created_at": "2026-11-18 10:53:00",
      "updated_at": "2026-11-18 10:53:00"
    }
  }
  ```

---

#### `PUT /api/tasks/:id`
Updates an existing task, toggles completion, or reschedules to a new date and time.

* **Authentication:** Protected (`Authorization: Bearer <token>`)
* **Path Parameter:** `id` (e.g., `task-1`)
* **Request Body (Partial Update / Reschedule Example):**
  ```json
  {
    "due_date": "2026-11-20",
    "due_time": "14:00"
  }
  ```
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Task updated successfully.",
    "task": {
      "id": "task-1",
      "title": "Complete Data Structures Assignment",
      "due_date": "2026-11-20",
      "due_time": "14:00",
      "completed": false
    }
  }
  ```

---

#### `DELETE /api/tasks/:id`
Permanently deletes a task.

* **Authentication:** Protected (`Authorization: Bearer <token>`)
* **Path Parameter:** `id`
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Task deleted successfully.",
    "taskId": "task-1"
  }
  ```

---

### 4.3 Daily Schedule Endpoints

#### `GET /api/schedules`
Retrieves daily schedule items. Supports optional single-day filtering.

* **Authentication:** Protected (`Authorization: Bearer <token>`)
* **Query Parameters:** `date` (optional, e.g., `?date=2026-11-18`)
* **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "schedules": [
      {
        "id": "sch-1",
        "user_id": "demo-user-123",
        "title": "Wake Up & Morning Routine",
        "date": "2026-11-18",
        "start_time": "07:00",
        "end_time": "08:00",
        "category": "Personal",
        "notes": "",
        "completed": true
      }
    ]
  }
  ```

---

#### `POST /api/schedules`
Creates a new timeline block.

* **Authentication:** Protected (`Authorization: Bearer <token>`)
* **Request Body:**
  ```json
  {
    "title": "Data Structures Lecture",
    "date": "2026-11-18",
    "start_time": "09:00",
    "end_time": "11:00",
    "category": "Class",
    "notes": "LH-3 Room"
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Schedule created successfully.",
    "schedule": {
      "id": "sch_1731908600000_rst45",
      "title": "Data Structures Lecture",
      "start_time": "09:00",
      "end_time": "11:00",
      "completed": false
    }
  }
  ```

---

### 4.4 Focus Timer & Distraction Reflection Endpoints

#### `POST /api/focus-sessions`
Logs a finished Pomodoro study block.

* **Authentication:** Protected (`Authorization: Bearer <token>`)
* **Request Body:**
  ```json
  {
    "task_id": "task-1",
    "duration_minutes": 25
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Focus session recorded successfully.",
    "session": {
      "id": "foc_1731908700000_pqr12",
      "user_id": "demo-user-123",
      "task_id": "task-1",
      "duration_minutes": 25,
      "task_title": "Complete Data Structures Assignment",
      "completed_at": "2026-11-18 10:53:00"
    }
  }
  ```

---

#### `POST /api/reflections`
Upserts daily student self-reported distraction and focus ratings.

* **Authentication:** Protected (`Authorization: Bearer <token>`)
* **Request Body:**
  ```json
  {
    "date": "2026-11-18",
    "distraction_level": "30–60 min",
    "focus_level": "Good",
    "notes": "Kept phone in hostel bag during lecture session."
  }
  ```
* **Success Response (`200 OK` or `201 Created`):**
  ```json
  {
    "success": true,
    "message": "Daily reflection saved successfully.",
    "reflection": {
      "id": "ref-1",
      "user_id": "demo-user-123",
      "date": "2026-11-18",
      "distraction_level": "30–60 min",
      "focus_level": "Good",
      "notes": "Kept phone in hostel bag during lecture session."
    }
  }
  ```
