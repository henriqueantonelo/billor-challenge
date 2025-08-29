# Billor Challenge - Projects & Notes
Tech Stack

Frontend: React (Vite)

Backend: NestJS

Database: PostgreSQL (TypeORM)

Language: TypeScript

Run Locally
Requirements

Node.js 18+

PostgreSQL 15+

Steps
# Clone repo
git clone https://github.com/henriqueantonelo/billor-challenge.git
cd billor-challenge-notes

# Backend
cd backend
npm install
npm run typeorm migration:run
npm run start:dev

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev

URLs

Frontend: http://localhost:5173

Backend API: http://localhost:3000

Swagger Docs: http://localhost:3000/api

===========

# Pending Features and How I Would Implement Them:

Idempotency: Middleware in NestJS with Redis to block duplicate requests.

ETag: Interceptor in NestJS to send and check ETag headers.

Cursor Pagination: Use WHERE id > lastId instead of offset for pagination.

Search: Add search parameter and use ILIKE in PostgreSQL.

Optimistic UI Updates: Update UI immediately in React and revert on failure.

Accessibility: Add aria-label, keyboard navigation, and focus control.

*Due to time constraints, balancing my current job and university studies, I was not able to implement all requested features. I prioritized delivering a functional version of the application with a solid foundation for future improvements. In the section “Pending Features and How I Would Implement Them,” I have described how I would approach each missing feature to meet the requirements in a complete solution.*

