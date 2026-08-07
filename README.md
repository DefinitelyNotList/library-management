# Library Management System

## Tech Stack
- **Backend:** Java, Spring Boot, SQL Server, REST APIs, JWT Authentication  
- **Frontend:** React.js, Vite, HTML, CSS, JavaScript  
- **Tools & Integrations:** Postman, Git/GitHub, IntelliJ IDEA, VS Code

---
Demo(pw=123456)
mail: reader111@gmail.com/demolibrarian@gmai.com/demoadmin@gmail.com

---
## Features
<details>
<summary><strong>Backend Features</strong></summary>

- Book catalog CRUD operations  
- Membership plan management and assignment  
- Book issue and return logic  
- Overdue fine calculation and tracking  
- Email notifications for overdue books  

</details>

<details>
<summary><strong>Frontend Features</strong></summary>

- Responsive UI for users and admin  
- User authentication (Login/Register)  
- Book search, browsing, and borrowing interface  
- Membership plan display and management  

</details>

---

## Folder Structure
```text
## LibraryManagement/
 ┣ 📁 backend/   # Spring Boot backend
 ┗ 📁 frontend/  # React frontend

Getting Started

The supplied SQL schema is managed outside Hibernate (`ddl-auto=none`).

Run the backend:
.\mvnw.cmd spring-boot:run
or via IntelliJ IDEA

Frontend Setup
cd frontend
npm install
npm run dev

## Database-backed APIs

- `GET/POST/PUT/DELETE /api/books` — catalog search and book CRUD. The response keeps the
  existing frontend fields (`author`, `genre`, `totalCopies`, `availableCopies`) while storing
  data in `Authors`, `Categories`, `Publishers`, and `Books`.
- `GET /api/library/lookups/{authors|categories|publishers}` — form lookup data.
- `POST /api/library/borrows`, `POST /api/library/borrows/{borrowDetailId}/return` — issue and
  return books with stock, overdue, and fine checks.
- `GET /api/library/borrows/history?readerId=...`, `GET /api/library/borrows/overdue`, and
  `GET /api/library/statistics` — history, overdue report, and dashboard statistics.

Project Status
✅ Backend + Frontend completed
⚡ Future: Cloud deployment, AI chatbot improvements, advanced analytics dashboards
