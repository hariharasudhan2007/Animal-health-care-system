# 🐾 VetCare — Animal Health Care Management System

A modern, full-stack Veterinary Clinic & Animal Health Care Management System built with **FastAPI** (Python 3.x), **SQLite**, and a responsive, high-performance web frontend. Fully compliant with **`srs.md`** and **`REQUIREMENTS.md`**.

---

## 🚀 Key Features & SRS Compliance

| Module | SRS ID | Description |
|---|---|---|
| **🐾 Pet Owner & Pet CRUD** | `FR-01` | Register, view, search, edit, and delete pet records with species, breed, age, gender, weight, medical history, and status. Includes Digital Pet Passport viewer and print format. |
| **🩺 Doctor Availability & Appointments** | `FR-02` | View doctor schedules, specialties, ratings, and time slots. Book appointments in **5 clicks or fewer** (`NFR-03`). Staff approval queue with 1-click status actions. |
| **💉 Health Records & Vaccination** | `FR-03` | Log clinical checkups, track vaccination statuses (`Up to Date 🟢`, `Due Soon 🟡`, `Overdue 🔴`), diagnose, and record treatments. Pet health status syncs automatically. |
| **💳 Billing & Invoices** | `FR-04` | Automated fee calculations: $\text{Total} = \text{Consultation} + \text{Treatment} + \text{Medication}$. Interactive calculator, payment tracking (`Paid`, `Pending`), and printable invoice receipts. |
| **📊 Staff Dashboard & Announcements** | `FR-05` | Real-time KPI stat cards (Patients, Pending Approvals, Confirmed Appointments, Settled Revenue), appointment queue, and clinic announcements manager. |
| **🎪 Wellness Events & Health Camps** | `FR-06` | Browse upcoming community health camps, vaccination drives, and nutrition workshops. 1-click participant registration with live capacity tracking. |
| **📈 Reports & Analytics** | `Analytics` | Comprehensive clinic reporting module with revenue breakdown, appointment status distribution, vaccination compliance metrics, and printable report sheets. |

---

## 🔒 Non-Functional Requirements (NFR) Compliance

- **NFR-01 (Speed)**: Sub-2 second response times achieved via local SQLite with Write-Ahead Logging (`WAL` mode) and optimized indexed queries.
- **NFR-02 (Security)**: Passwords encrypted with **SHA-256** using a secure salt prefix (`vetcare_secure_salt_2026_clinic_hash` > 16 bytes).
- **NFR-03 (Usability)**: Complete pet registration or appointment booking in 5 clicks or fewer with intuitive modal forms and interactive slot chips.
- **NFR-04 (Reliability)**: Relational SQLite database with foreign key cascades (`PRAGMA foreign_keys = ON`), transaction integrity, and robust input validation.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.8+ + **FastAPI** + **Uvicorn** + **Pydantic v2**
- **Database**: **SQLite3** (`vetcare.db` with WAL mode & automated seeding)
- **Frontend**: **HTML5** + **CSS3** (modern responsive design system with dark/light themes) + **Vanilla JavaScript** (ES6+ Fetch API)
- **API Documentation**: Auto-generated interactive Swagger UI at `/docs`

---

## 📦 Prerequisites

- Python 3.8 or newer
- `pip` (Python package manager)

---

## ⚡ Quick Setup & Run Instructions

### 1. Install Dependencies
Open a terminal in the project directory and run:
```bash
pip install fastapi uvicorn pydantic python-multipart
```

*(Optional for running tests: `pip install httpx pytest`)*

### 2. Launch the Application
Run the single-command launcher:
```bash
python run.py
```

The application will start at **http://127.0.0.1:8000** and automatically launch your default web browser.

**Alternative manual launch:**
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 🔑 Demo Login Credentials

The database comes pre-seeded with realistic data for immediate testing:

| Role | Email | Password | Access / Features |
|---|---|---|---|
| 🐾 **Pet Owner** | `alice.johnson@example.com` | `owner123` | Pet CRUD, Digital Passport, 1-Click Booking, Invoices, Events |
| 🐾 **Pet Owner 2** | `robert.smith@example.com` | `owner123` | Multi-pet profile management |
| 🩺 **Doctor / Staff** | `sarah.jenkins@vetcare.com` | `doctor123` | Staff Dashboard, Queue, Checkup Logging, Billing, Announcements, Reports |
| 🩺 **Doctor 2** | `alan.grant@vetcare.com` | `doctor123` | Exotic & Surgery Unit Consultations |

> **Tip**: You can also register a new custom account directly on the login screen or toggle between portals using the sidebar switcher.

---

## 🧪 Running the Automated Verification Test Suite

To run the complete automated test suite verifying all 6 Functional Requirements and 4 Non-Functional Requirements:

```bash
python test_app.py
```

All 11 test suites verify database initialization, salted password encryption, authentication, pet CRUD, doctor bookings, health logging, billing calculations, dashboard stats, announcements, event registrations, and report summaries.

---

## 📖 API Documentation

With the server running, visit **http://127.0.0.1:8000/docs** to explore interactive Swagger API documentation.

### Core Endpoints Overview:
- `POST /api/auth/register` — Create new pet owner or doctor account
- `POST /api/auth/login` — Authenticate and retrieve user session
- `PUT /api/auth/profile/{id}` — Update user profile details
- `POST /api/auth/change-password/{id}` — Change user password
- `GET /api/pets` — List and search pets with filters (`query`, `species`, `owner_id`)
- `POST /api/pets` — Register a new animal patient
- `PUT /api/pets/{id}` — Update pet details and health status
- `DELETE /api/pets/{id}` — Delete pet record
- `GET /api/doctors` — List doctors with availability slots and fees
- `GET /api/appointments` — List appointments with filters (`query`, `status`, `doctor_id`, `owner_id`)
- `POST /api/appointments` — Book new consultation
- `PUT /api/appointments/{id}/status` — Update status (`Confirmed`, `Cancelled`)
- `POST /api/appointments/{id}/complete` — Complete consultation (saves diagnosis, health log, and generates bill)
- `GET /api/health-logs` — List medical checkup and vaccination records
- `POST /api/health-logs` — Record new medical checkup
- `GET /api/invoices` — List billing records with filters (`query`, `status`, `owner_id`)
- `POST /api/invoices` — Generate new billing invoice
- `PUT /api/invoices/{id}/status` — Update payment status (`Paid`, `Pending`)
- `GET /api/announcements` — List clinic announcements
- `POST /api/announcements` — Post new announcement
- `DELETE /api/announcements/{id}` — Remove announcement
- `GET /api/events` — List upcoming wellness events
- `POST /api/events/register` — Register owner and pet for wellness camp
- `GET /api/dashboard/stats` — Retrieve clinic-wide KPI metrics
- `GET /api/reports/summary` — Retrieve clinic analytics and revenue breakdowns

---

## 📂 Project Structure

```
Animal-health-care-system/
├── main.py              # FastAPI application with REST endpoints & static file serving
├── database.py          # SQLite connection, WAL mode, schema initialization & seed data
├── crud.py              # High-performance database query and aggregation functions
├── schemas.py           # Pydantic v2 validation models and response schemas
├── run.py               # Single-command launcher with browser auto-open
├── test_app.py          # Comprehensive verification test suite
├── index.html           # Modern Single-Page Application (SPA) frontend
├── register-pet.html    # Standalone pet registration portal connected to API
├── style.css            # Complete modern healthcare CSS design system (Light/Dark themes)
├── script.js            # Frontend JavaScript application logic & API integration
├── assets/              # Avatar images for doctors and pets
├── srs.md               # Software Requirements Specification (Source of Truth)
├── REQUIREMENTS.md      # Detailed requirements and acceptance criteria specification
└── README.md            # Setup, documentation, and user guide
```
