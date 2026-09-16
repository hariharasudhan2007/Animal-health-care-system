# VetCare — Animal Health Care Management System: Requirements Specification

This document serves as the formal functional and non-functional requirements specification (Source of Truth) for the **VetCare Animal Health Care Management System**, aligned with `srs.md` and `User Stories.txt`.

---

## 1. System Purpose & Scope

### 1.1 Purpose
The purpose of the **VetCare Animal Health Care Management System** is to digitize, streamline, and manage pet owner profiles, pet health records, veterinary doctor schedules, appointment bookings, medical checkups and vaccination histories, consultation/medication billing, veterinary staff workflows, and community wellness events through a unified local web application.

### 1.2 IN Scope
- Pet owner registration, profile management, and complete pet records management (species, breed, age, gender, weight, status, medical history).
- Viewing veterinary doctor schedules and booking appointment consultations in 5 clicks or fewer.
- Veterinary staff recording of medical checkups, vaccination statuses, diagnosis, and treatment histories.
- Automated consultation, treatment, and medication fee calculations with payment status tracking (Pending, Paid, Cancelled).
- Dedicated Veterinary Staff Dashboard displaying appointment queues, patient health summaries, clinic announcements, and key performance metrics.
- Comprehensive clinic Reports & Analytics module covering revenue summaries, appointment metrics, and vaccination compliance.
- Listing and registration for pet health camps, vaccination drives, and wellness workshops.

### 1.3 OUT of Scope
- Integration with third-party payment gateways or banking APIs.
- Real-time GPS location tracking for animals.
- Automated external SMS/WhatsApp/email notification gateways.
- Video conferencing / telemedicine consultations.
- Multi-branch or chain clinic distributed server synchronization.

---

## 2. Functional Requirements (FR)

| Requirement ID | Module | Description | Acceptance Criteria |
|---|---|---|---|
| **FR-01** | Pet & Profile Management | The system shall allow pet owners to create accounts, register pet details (species, breed, age, gender, weight, medical history, health status), view/edit/delete pet records, and view a Digital Pet Passport. | - Owner can add new pets with validation.<br>- Pet records display health status badges (`Healthy 🟢`, `Booster Due 🟡`, `Vaccination Overdue 🔴`).<br>- Search & filter by species, pet name, breed, or owner. |
| **FR-02** | Doctor Schedules & Appointments | The system shall display veterinary doctor availability slots, consultation types, and enable pet owners to select and book appointment consultations in 5 clicks or fewer. | - Displays doctor specialties, experience, ratings, and time slots.<br>- Owner can book with selected doctor, date, and slot.<br>- Staff can confirm, complete, or cancel appointments. |
| **FR-03** | Medical Checkups & Vaccination | The system shall allow veterinary staff to record medical checkups, update vaccination statuses (`Up to Date`, `Due Soon`, `Overdue`), and track detailed animal treatment history for each session. | - Staff can log checkup date, vaccine name, diagnosis, next due date, and treatment notes.<br>- Pet health status automatically syncs with vaccination status. |
| **FR-04** | Billing & Invoices | The system shall manage automated consultation, treatment, and medication fee calculations while tracking payment statuses (`Pending`, `Paid`, `Cancelled`) with printable invoice receipts. | - Formula: $\text{Total} = \text{Consultation Fee} + \text{Treatment Fee} + \text{Medication Fee}$.<br>- Interactive fee calculator.<br>- 1-click "Mark as Paid" and printable invoice receipt. |
| **FR-05** | Staff Dashboard & Announcements | The system shall provide a dashboard for veterinary staff to view appointment queues, manage patient records, and publish clinic health announcements. | - Summary KPI cards (Total Pets, Pending Approvals, Confirmed Today, Revenue, Vaccine Alerts).<br>- Appointment queue with 1-click status actions.<br>- Clinic announcements post & delete capability. |
| **FR-06** | Wellness Events & Health Camps | The system shall display upcoming pet health camps, vaccination drives, and wellness workshops, allowing pet owners to register for participation. | - Lists event title, date, time, location, description, capacity, and enrolled count.<br>- Registration form captures owner name, pet name, and contact phone.<br>- Real-time registration progress bar. |

---

## 3. Non-Functional Requirements (NFR)

| Requirement ID | Category | Metric / Constraint | Implementation |
|---|---|---|---|
| **NFR-01** | **Speed** | Process database queries and load search/record results within **2.0 seconds** under normal local operation. | Local SQLite database with Write-Ahead Logging (WAL) and indexed columns (`owner_id`, `pet_id`, `doctor_id`, `status`). |
| **NFR-02** | **Security** | Store user passwords using **SHA-256** or bcrypt hashing with a minimum salt length of **16 bytes**. | Salted SHA-256 hash using `vetcare_secure_salt_2026` (24 bytes) prefix with UTF-8 encoding. |
| **NFR-03** | **Usability** | Enable a first-time user to complete pet registration or appointment booking in **5 clicks or fewer** without external training. | Direct 1-click doctor slot selection, pre-filled modal forms, responsive cards, and clean visual step progression. |
| **NFR-04** | **Reliability** | Maintain a minimum operational uptime and successful transaction completion rate of **99.5%** without data corruption during normal operation. | SQLite transaction safety, foreign key cascades, input validation via Pydantic, and graceful error handling. |

---

## 4. User Roles & Access Control

1. **Pet Owner (`owner`)**:
   - Register account & manage profile.
   - Register, view, edit, and delete their own pets.
   - View digital pet passports and vaccination histories.
   - Browse doctors and book appointments.
   - View personal billing invoices and print receipts.
   - Register for community wellness events.

2. **Veterinary Doctor / Staff (`doctor` / `staff`)**:
   - Access Veterinary Staff Dashboard with full analytics.
   - View, approve, cancel, and complete appointment consultations.
   - Record medical checkups, diagnoses, prescriptions, and vaccination statuses.
   - Generate billing invoices and update payment statuses.
   - Publish and delete clinic announcements.
   - Access comprehensive clinic Reports & Analytics.

---

## 5. Technology Stack & Constraints

- **Backend**: Python 3.8+ with **FastAPI** (REST API) & **Uvicorn** (ASGI server).
- **Database**: **SQLite3** (local relational database file `vetcare.db`).
- **Data Validation**: **Pydantic v2** models.
- **Frontend**: **HTML5**, **CSS3** (modern responsive design system with CSS custom properties), and **Vanilla JavaScript (ES6+)** with Fetch API.
- **Deployment**: Local execution via `python run.py`.
