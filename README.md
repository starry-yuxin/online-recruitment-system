# online-recruitment-system

This project is a database course project that implements a full-stack **Online Recruitment System**, including a frontend web UI, backend REST APIs, and MySQL database scripts. It follows a **frontend–backend separated architecture**: the frontend handles page rendering and user interaction, while the backend provides REST APIs and interacts with the MySQL database.

The system covers a typical recruitment workflow and focuses on modules such as **user authentication**, **job browsing and applications**, **company management**, and **news/announcements publishing**, with an admin panel for management and maintenance.

---

## Feature Overview (Project Description)

> The following is a high-level description of the system features.

- **User Side**
  - User registration / login (JWT authentication)
  - Browse job listings and view job details
  - Favorite jobs and view favorites
  - Apply for jobs and view application history
  - Edit resume and set resume visibility (e.g., visible to companies)

- **Company Side**
  - Maintain company profile information
  - Publish and manage job postings (create/edit/enable/disable)
  - View and process applications
  - Publish and manage company news/updates

- **Public Information**
  - Company list / company detail pages
  - Recruitment news list / news detail pages

- **Admin Panel**
  - User management (CRUD / roles & permissions)
  - Company management
  - News management
  - Admin dashboard overview

---

## Tech Stack

### Frontend
- **Vue 3**
- **Vite**
- **TypeScript**
- **Element Plus**
- **Pinia**
- **Vue Router**
- **Axios**
- **ECharts**

Frontend scripts (from `frontend/package.json`):
- `npm run dev`: start development server (Vite)
- `npm run build`: build for production

#### Frontend Highlights
- **Component-based development**: organize pages/modules under `views/` and `layout/` for maintainability
- **Route partitioning**: public/user/company/admin pages are organized via Vue Router
- **State management**: global states such as auth/user info are managed by Pinia
- **Unified API layer**: Axios-based HTTP wrapper for handling tokens and error responses consistently
- **Visualization**: ECharts for charts/overview pages (e.g., admin dashboard)

---

### Backend
- **Node.js + Express**
- **TypeScript**
- **tsx**: run TypeScript in development with watch mode
- **dotenv**: load environment variables from `.env`
- **mysql2**: MySQL database driver
- **jsonwebtoken (JWT)**: authentication tokens
- **bcrypt**: password hashing
- **multer**: file upload handling
- **cors**: CORS support

Backend scripts (from `backend/package.json`):
- `npm run dev`: development mode (`tsx watch src/server.ts`)
- `npm run build`: compile TypeScript (`tsc -p tsconfig.json`)
- `npm run start`: run compiled output (`node dist/server.js`, requires build first)

#### Backend Highlights
- **Layered & modular routing**: routes split by modules (auth / jobs / companies / news / resume / favorites / applications / admin, etc.)
- **Authentication & authorization**
  - **JWT** for session/authentication and API protection
  - Middleware-based **RBAC (role-based access control)** (e.g., admin / company / user roles)
- **Security**: password storage with **bcrypt** hashing
- **Unified error handling**: centralized error middleware with consistent response format
- **File uploads**: **multer** for uploads such as avatars/company images (if used in the project)
- **CORS support**: via `cors` for separated frontend/backend deployment

---

### Database
- **MySQL**
- Database scripts provided at the repository root:
  - `schema.sql`: schema / table creation script
  - `seed.sql`: optional initial/seed data script

#### Database Design Notes
- Relational modeling based on core recruitment entities:
  - User, Company, Job, Resume, Application, Favorite, News, etc.
- Relationships are represented via primary keys / foreign keys (or logical relations), for example:
  - Company → Jobs
  - User → Resume
  - User → Application → Job
  - User → Favorite → Job
- `schema.sql` manages schema and constraints; `seed.sql` can be used to populate demo data for presentation/testing.

---
