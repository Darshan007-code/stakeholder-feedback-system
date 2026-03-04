# Stakeholder Feedback System - System Design

## 1. Architecture Overview
The system follows a three-tier architecture:
- **Frontend**: A single-page application (SPA) built with **React (Vite/TypeScript)** and **Vanilla CSS**.
- **Backend API**: A RESTful API built with **Node.js** and **Express.js**.
- **Database**: **PostgreSQL** (using **SQLite** for the prototype to ensure portability).

## 2. Tech Stack Decision
- **Frontend**: React for its component-based architecture and powerful state management.
- **Backend**: Express.js for its simplicity and large ecosystem.
- **ORM/Query Builder**: **Prisma** or **Knex.js** for database interactions.
- **Authentication**: **JSON Web Tokens (JWT)** for stateless user sessions.

## 3. Module Breakdown
### 3.1 Frontend Modules
- **AuthModule**: Login, registration, and role-based route protection.
- **FeedbackModule**: Form components for different feedback categories.
- **DashboardModule**: Personalized views for different stakeholders (Student/Parent vs. Admin).
- **AdminModule**: Ticket management, analytics charts, and resolution tools.

### 3.2 Backend Services
- **AuthService**: Handles user authentication, registration, and token generation.
- **FeedbackService**: CRUD operations for feedback submissions and status tracking.
- **EvaluationService**: Management of teacher performance reviews.
- **AnalyticsService**: Aggregates feedback data for administrative reports.

### 3.3 Database Schema (Proposed Entities)
- **Users**: id, name, email, role, password_hash.
- **Feedback**: id, user_id, category, message, status (Open/In Progress/Resolved), created_at.
- **TeacherEvaluations**: id, evaluator_id, teacher_id, ratings (JSON), comments, created_at.
- **Resolutions**: id, feedback_id, admin_id, resolution_text, updated_at.
