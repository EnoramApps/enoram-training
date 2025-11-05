# 🧱 Technical Documentation – Warkop Job Platform

**Author:** Tantowi Alif Feryansyah
**Date:** November 2025

---

## 🧭 Overview

Warkop is a **LinkedIn-style job platform** tailored for the Indonesian audience.
This document outlines the **technical architecture**, **data model**, and **API design** used in the system.

It supports two main user roles:

- **Recruiter (HR):** Creates and manages job postings.
- **Candidate:** Searches, applies, and tracks job applications.

---

## ⚙️ System Architecture

The platform follows a **three-tier architecture**:

```
Frontend (Next.js + TailwindCSS)
        │
        ▼
Backend API (Node.js + Express)
        │
        ▼
Database (Firebase Firestore)
```

### Components:

| Layer      | Technology                    | Description                                     |
| ---------- | ----------------------------- | ----------------------------------------------- |
| Frontend   | Next.js (TypeScript)          | UI for Recruiter & Candidate                    |
| Backend    | Node.js + Express             | REST API layer for CRUD & Auth                  |
| Database   | Firebase Firestore            | NoSQL storage for jobs, users, and applications |
| Auth       | Firebase Authentication / JWT | Secure login for both roles                     |
| Deployment | Vercel / Firebase Hosting     | Fast CI/CD for web hosting                      |

---

## 🧩 Entity Relationship Diagram (ERD)

```
+----------------+
| users          |
+----------------+
| id (PK)        |
| name           |
| email          |
| phone          |
| role           | ← recruiter / candidate
| created_at     |
+----------------+
        |
        |
        ▼
+----------------+
| jobs           |
+----------------+
| id (PK)        |
| recruiter_id (FK → users.id) |
| title          |
| location       |
| job_type       |
| salary_range   |
| description    |
| requirements   |
| benefits       |
| status         | ← draft / published
| created_at     |
+----------------+
        |
        |
        ▼
+-------------------------------+
| applications                  |
+-------------------------------+
| id (PK)                       |
| job_id (FK → jobs.id)         |
| candidate_id (FK → users.id)  |
| resume_url                    |
| cover_letter                  |
| status                        | ← applied / shortlisted / rejected / hired
| applied_at                    |
+-------------------------------+
```

---

## 🌐 API Specification

| Endpoint               | Method | Description                               | Auth |
| ---------------------- | ------ | ----------------------------------------- | ---- |
| `/auth/register`       | POST   | Register a new user (candidate/recruiter) | ❌   |
| `/auth/login`          | POST   | User login & JWT generation               | ❌   |
| `/jobs`                | GET    | Get all published jobs                    | ❌   |
| `/jobs/:id`            | GET    | Get job details                           | ❌   |
| `/jobs`                | POST   | Create a job posting (recruiter)          | ✅   |
| `/jobs/:id`            | PATCH  | Edit job posting                          | ✅   |
| `/jobs/:id/applicants` | GET    | List applicants for a job                 | ✅   |
| `/applications`        | POST   | Candidate applies to a job                | ✅   |
| `/applications/:id`    | PATCH  | Update applicant status                   | ✅   |
| `/messages`            | POST   | Send message recruiter ↔ candidate        | ✅   |

---

## 🔐 Authentication Flow

1. User logs in using Firebase Auth (or custom JWT).
2. Auth token stored in localStorage.
3. All protected endpoints require header:
   ```
   Authorization: Bearer <token>
   ```

---

## 💾 Firestore Structure Example

```
/users/{userId}
  name: "Tantowi Alif"
  email: "tantowi@mail.com"
  role: "recruiter"

/jobs/{jobId}
  recruiter_id: "user123"
  title: "Frontend Developer"
  status: "published"
  created_at: "2025-11-05"

/applications/{appId}
  job_id: "job456"
  candidate_id: "user789"
  status: "applied"
  resume_url: "https://storage.warkop/resume.pdf"
```

---

## 🚀 Deployment Flow

1. Developer pushes code to GitHub (`enoram-training` repo).
2. Firebase CI/CD triggers automatic build.
3. Next.js frontend → deployed to Vercel / Firebase Hosting.
4. Firestore serves as the real-time database backend.

---

## 🧠 Scalability Notes

- Uses Firestore indexes for efficient job search and filtering.
- Stateless backend API for easy horizontal scaling.
- Modular API routes for clear separation between Recruiter and Candidate functions.
- Ready to migrate backend to Go (Fiber/Gin) for enterprise scalability.

---

## 🧩 Summary

| Component    | Description                      |
| ------------ | -------------------------------- |
| Architecture | Modular 3-tier (Frontend–API–DB) |
| Database     | Firestore (NoSQL)                |
| Auth         | JWT / Firebase Auth              |
| Frontend     | Next.js + TailwindCSS            |
| API          | Node.js + Express                |
| Deployment   | Vercel / Firebase CI/CD          |

---

## 🧾 Author

**Tantowi Alif Feryansyah**
Backend & Fullstack Developer
📧 tantowialif.dev@gmail.com
📞 0859106975018
🔗 [LinkedIn](https://www.linkedin.com/in/tantowialif)
