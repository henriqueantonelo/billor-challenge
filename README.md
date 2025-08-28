Billor - Projects & Notes App
A full-stack application for managing projects and notes, built with React (Vite), NestJS, TypeORM, and PostgreSQL.
Setup

Install Docker and Docker Compose.
Clone the repository: git clone https://github.com/henriqueantonelo/billor-challenge.git
Run docker-compose up --build to start the app.
Frontend: http://localhost:5173
Backend: http://localhost:3000
Database: PostgreSQL on port 5432


The database is auto-bootstrapped with synchronize: true on first run.

Development

Frontend: cd frontend && npm run dev
Backend: cd backend && npm run start:dev
