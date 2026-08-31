Purpose and Scope

Purpose
The purpose of this system is to provide a digital platform for managing user accounts, class schedules, attendance, billing, instructor dashboards, and event registrations.

In Scope (Version 1)

User profile creation and management.

Class schedule viewing and enrollment.

Attendance tracking and reporting.

Automated membership billing management.

Instructor dashboard for class and announcement management.

Event viewing and registration.

Out of Scope (Version 1)

E-commerce plant selling features or inventory management.

Third-party payment gateway integration.

Social media integration or direct messaging.

Mobile application development.

Functional Requirements

FR-01: The system shall allow USER 1 to create an account and manage their personal details and dance preferences.

FR-02: The system shall display available dance classes with timings, instructors, and difficulty levels for USER 1 to view and enroll in.

FR-03: The system shall enable USER 2 to mark attendance for each class session and track member participation.

FR-04: The system shall manage automated monthly or yearly membership fees and display payment statuses for USER 1.

FR-05: The system shall provide USER 2 with a dashboard to view class details, member lists, and manage class content and announcements.

FR-06: The system shall display upcoming dance events, recitals, or competitions for USER 1 to register to participate.

Non-Functional Requirements

NFR-01 (Speed): The system shall process and render any page request within 2.0 seconds under normal operation.

NFR-02 (Security): The system shall encrypt all stored user passwords using SHA-256 or stronger algorithms.

NFR-03 (Usability): A new user shall be able to complete class registration in 3 steps or fewer without administrative assistance.

NFR-04 (Reliability): The system shall maintain an operational uptime of 99.5% during scheduled operational hours.

Assumptions and Constraints

Assumptions

Users have access to a standard web browser and an active internet connection.

USER 2 possesses the necessary permissions to manage classes and track member attendance.

Constraints

The application must be built using Python.

Data persistence must be managed strictly using an SQLite database.
************************************************************************************************************************************************************************************************************************************************************************************
Purpose and Scope

Purpose
The purpose of this Software Requirements Specification (SRS) is to define the functional and non-functional requirements for the online plant store management system. The system enables users to manage profiles, enroll in classes, track attendance, manage membership billing, oversee instructor operations, and register for performance events.

In Scope (Version 1)

Member Registration: Account creation and profile management for personal details and preferences.

Class Scheduling: Viewing available classes (with timing, instructor, and difficulty level) and user enrollment.

Attendance Tracking: Class attendance marking and participation tracking.

Membership Billing: Automated monthly or yearly fee management and payment status tracking.

Instructor Dashboard: Class detail management, member list viewing, and posting announcements.

Performance Events: Event listing display and participant registration.

Out of Scope (Version 1)

E-commerce plant selling, seed cataloging, or inventory management.

Direct in-app messaging between users and instructors.

Native mobile application development (iOS/Android).

Third-party payment gateway processing integration.
************************************************************************************************************************************************************************************************************************************************************************************
Functional Requirements

FR-01: The system shall allow USER 1 to create an account and manage their personal details and dance preferences.

FR-02: The system shall display available dance classes with timings, instructors, and difficulty levels for USER 1 to view and enroll in.

FR-03: The system shall enable USER 2 to mark attendance for each class session and track member participation.

FR-04: The system shall manage automated monthly or yearly membership fees and display payment statuses for USER 1.

FR-05: The system shall provide USER 2 with a dashboard to view class details, member lists, and manage class content and announcements.

FR-06: The system shall display upcoming dance events, recitals, or competitions and allow USER 1 to register for participation.
************************************************************************************************************************************************************************************************************************************************************************************
Non-Functional Requirements

NFR-01 (Speed): The system shall process and render any page request within 2.0 seconds under a concurrent load of 100 active users.

NFR-02 (Security): The system shall encrypt all stored user passwords using SHA-256 or stronger algorithms with a 100% compliance rate.

NFR-03 (Usability): A new user shall be able to complete class enrollment in 3 steps or fewer without administrative assistance.

NFR-04 (Reliability): The system shall maintain an operational uptime of at least 99.5% during scheduled operating hours.
************************************************************************************************************************************************************************************************************************************************************************************
Assumptions and Constraints

Assumptions

User Accessibility: End users possess an active internet connection and a compatible web browser to access the application.

Role Permissions: USER 2 holds the administrative privileges required to manage classes, record attendance, and view member rosters.

Data Accuracy: Users provide valid personal details and billing information during registration and account updates.

Constraints

Programming Language: The core backend application must be developed using Python.

Database Engine: Data storage and relational schema management must be strictly implemented using SQLite.

Architecture: System deployment and data access are constrained by SQLite’s single-file, concurrent-write limitations.
************************************************************************************************************************************************************************************************************************************************************************************
