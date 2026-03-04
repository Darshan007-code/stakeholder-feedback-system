# Stakeholder Feedback System - Comprehensive Requirements

## 1. Project Overview
A premium, full-stack feedback management ecosystem designed for educational institutions. The system provides a structured loop for collecting, tracking, and analyzing feedback from all institutional stakeholders while maintaining high standards of UI/UX and data integrity.

## 2. Stakeholder Roles & Access
- **Students**: 
    - Login via USN (Case-insensitive).
    - Submit feedback with ratings and attachments.
    - Evaluate teachers on quality, knowledge, and punctuality.
    - Track personal ticket status in real-time.
- **Parents**: 
    - Login via Parent ID.
    - Submit feedback regarding campus facilities, safety, and transport.
    - Track complaints.
- **Teachers**: 
    - Login via Employee ID.
    - Submit internal administrative feedback.
    - View anonymous "Performance Insights" (aggregate scores from students).
- **Employees**: 
    - Login via Employee ID.
    - Report operational and infrastructure problems.
- **Admins**: 
    - Login via Admin ID.
    - Full ticket management (Assign Dept, Update Status, Add Resolution).
    - Register new stakeholders (Students, Teachers, staff) via Dashboard.
    - View advanced Analytics (Charts).
    - Export system data to CSV.

## 3. Core Functional Requirements
### 3.1 Feedback & Ticket System
- **Unified Form**: Reusable submission interface with category, department, and 1-5 star ratings.
- **Evidence Support**: Capability to upload images/PDFs as supporting documentation.
- **Privacy**: Support for **Anonymous Mode** to protect users during sensitive reporting.
- **Lifecycle Management**: Tickets transition through *Open* → *Under Review* → *In Progress* → *Resolved* → *Closed*.

### 3.2 Analytics & Reporting
- **Departmental Load**: Visual breakdown of tickets per department.
- **Teacher Performance**: Average rating trends for each faculty member.
- **Feedback Velocity**: Monthly submission volume tracking.
- **Category Mix**: Doughnut charts showing topic distribution.
- **Exporting**: Capability to download filtered reports in CSV format.

### 3.3 Notifications
- **Dashboard Alerts**: Real-time notifications for feedback submission and status updates.
- **Email Simulation**: Backend logging of email dispatches for user updates.

## 4. Non-Functional & Technical Requirements
- **UI/UX**: High-end 3D design system using "Outfit" display typography and smooth entrance animations.
- **Responsiveness**: Mobile-first design ensuring usability on phones and tablets.
- **Security**: 
    - JWT-based session management.
    - Password hashing using Bcrypt.
    - Role-Based Access Control (RBAC) preventing unauthorized data access.
- **Database**: SQLite3 for portability, managed via Knex.js for structured schema handling.
- **API**: RESTful architecture built with Node.js/Express.
