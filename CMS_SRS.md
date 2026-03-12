# Software Requirement Specification (SRS)
## Content Management Application

### 1. Project Overview
The objective of this project is to develop a full stack Content Management Application that supports secure user authentication, role-based editorial workflows, category administration, analytics reporting, and administrative user governance.

Frontend: React 18, Redux Toolkit, React Router, Bootstrap, React Hook Form, Yup
Backend: Spring Boot 3.3.5, Spring Web, Spring Data JPA, Spring Validation
Database: MySQL for development and H2 for automated tests
Security: Spring Security with JWT-based authentication and role-based authorization
Testing: JUnit integration tests for backend APIs and Jest plus React Testing Library for frontend behavior
Deployment Readiness: environment-based configuration, CORS setup, token refresh flow, and operational security requirements

The system follows a structured editorial lifecycle in which authenticated users can author content, managers can review and publish content, and administrators can govern users and audit privileged actions. The application exposes REST APIs on the backend and a responsive single-page interface on the frontend.

### 2. System Scope and Actors
This application is designed for teams that need a controlled publishing workflow with clear role separation and visibility over content and users.

Actors
- Guest visitor who can access public authentication pages and published content listings.
- Registered user or author who can sign in, create posts, edit owned posts, and work primarily in draft mode.
- Manager who can review posts, publish or revert content, manage categories, and view analytics.
- Administrator who can perform all managerial actions and additionally manage non-admin users and review audit logs.

Core Modules
- Authentication and session management
- Post authoring, editing, detail viewing, and deletion
- Draft queue and publish or unpublish workflow
- Category management
- Analytics dashboard
- Administrative user management and audit logging
- Theme persistence and responsive navigation

Primary Data Entities
- User with account identity, status, and assigned roles
- Role for permission mapping across user, manager, and administrator access levels
- Post with title, body, status, author, category, and timestamps
- Category with name, description, and related posts
- AuditLog for privileged administrative actions

### 3. Functional Requirements

#### FR-1. User Registration
The system shall allow a new user to register with username, email, and password.
- Username and email shall be unique.
- Newly registered users shall receive the default ROLE_USER authority.
- Successful registration shall return authenticated session data including access and refresh tokens.

#### FR-2. User Login and Token Refresh
The system shall authenticate existing users and maintain secure sessions.
- Users shall be able to log in with valid credentials.
- Invalid credentials shall be rejected with an error response.
- The system shall provide a refresh-token endpoint to issue renewed access tokens.

#### FR-3. Protected Access Control
The system shall restrict protected pages and APIs based on authentication and authorization rules.
- Unauthenticated users shall be redirected away from protected frontend routes.
- Backend endpoints shall enforce access using Spring Security and method-level authorization.
- Permission-sensitive UI elements shall only render for authorized roles.

#### FR-4. Published Post Listing
The system shall display published posts to users through the main editorial dashboard.
- The listing shall show title, category, author, creation date, and publication status.
- The listing shall support pagination using a configurable page size.
- The listing shall support month-based filtering for published posts.

#### FR-5. Post Detail Viewing
The system shall provide a detailed view for a selected post.
- The post detail page shall display category, status, author, created date, and full body content.
- Draft publication controls shall appear only when the current user has publish permission.

#### FR-6. Post Creation
The system shall allow authenticated users to create new posts.
- A post shall require title, body, category, and status input.
- Users without publish permission shall have post status enforced to DRAFT.
- Managers and administrators shall be able to create posts directly as DRAFT or PUBLISHED.

#### FR-7. Post Editing and Deletion
The system shall allow authorized users to modify or remove posts.
- Authors shall be able to edit their own posts.
- Administrators shall be able to delete any post.
- Unauthorized edit or delete operations shall be blocked.

#### FR-8. Draft Queue and Publication Workflow
The system shall support a separate workflow for draft review and publication.
- Managers and administrators shall be able to view a dedicated draft queue.
- Managers and administrators shall be able to publish draft posts.
- Managers and administrators shall be able to move published posts back to draft status.

#### FR-9. Category Management
The system shall support administrative maintenance of content categories.
- Authenticated users shall be able to retrieve category options.
- Managers and administrators shall be able to create categories.
- The backend shall support update and delete operations for categories.
- The current frontend shall provide category creation, listing, and deletion workflows.

#### FR-10. Analytics Reporting
The system shall provide role-restricted operational metrics for editorial monitoring.
- Managers and administrators shall be able to view a summary of posts, categories, and users.
- Managers and administrators shall be able to view monthly post creation counts.
- Analytics responses shall be retrieved through secured backend APIs.

#### FR-11. Administrative User Management
The system shall provide user governance capabilities to administrators.
- Administrators shall be able to view non-admin users.
- Administrators shall be able to change user roles between ROLE_USER and ROLE_MANAGER.
- Administrators shall be able to deactivate non-admin accounts.
- The system shall prevent administrators from deactivating their own account.
- The system shall prevent modification of administrator accounts through the management workflow.

#### FR-12. Audit Logging
The system shall record important administrative actions for traceability.
- Role assignment shall generate an audit log entry.
- User deactivation shall generate an audit log entry.
- Audit logs shall be retrievable through an administrator-only API.

#### FR-13. Validation and Error Feedback
The system shall provide validation and user-facing feedback across critical workflows.
- Frontend forms shall validate input using defined schemas.
- Backend APIs shall validate incoming request payloads.
- Errors shall be surfaced to users through toast notifications or explicit API responses.

#### FR-14. Theme Persistence and Usability Enhancements
The system shall support theme switching and resilient UI behavior.
- Users shall be able to toggle between light and dark themes.
- The selected theme shall persist in local storage.
- Invalid or missing date values shall degrade gracefully instead of breaking the interface.

#### FR-15. Role-Aware Navigation
The system shall tailor navigation options based on current permissions.
- Sidebar links shall highlight the active workspace location correctly.
- Restricted navigation entries shall only be visible to eligible roles.
- Unauthorized users shall be redirected to an explicit unauthorized page when needed.

### 4. Non-Functional Requirements

#### NFR-1. Security
The application shall secure authentication and authorization flows through JWT token handling, password encoding, role-based endpoint protection, and restricted administrative operations.

#### NFR-2. Performance
The application shall use paginated post retrieval and efficient summary queries so that core dashboards remain responsive under normal editorial workloads.

#### NFR-3. Reliability
The application shall maintain consistent state between frontend and backend, handle invalid input gracefully, and provide deterministic behavior for draft and publish operations.

#### NFR-4. Usability
The user interface shall remain responsive on desktop and mobile layouts, provide clear feedback for actions, and maintain accessible navigation and form interactions.

#### NFR-5. Maintainability
The system shall follow a layered backend architecture, modular Redux-based frontend state management, reusable form components, and centralized utility functions to support future enhancement.

#### NFR-6. Testability
The system shall include automated backend and frontend test coverage for critical workflows including authentication, post lifecycle management, administrative restrictions, and UI regressions.

#### NFR-7. Compatibility
The frontend shall communicate with the backend over HTTP APIs with configured CORS support for local development, and the interface shall support modern web browsers.

#### NFR-8. Data Integrity
The application shall enforce entity relationships between users, posts, and categories, and it shall preserve audit trails for privileged account operations.

### 5. Phase I - Requirement Analysis and System Design

#### Day 1 - Project Analysis and UML Diagram
Objective
Understand the CMS domain, define user responsibilities, and design the system architecture.

Functional Activities
- Define the problem statement for controlled content publishing.
- Identify the roles, permissions, and editorial workflow.
- Design system models for entities and data flow.

Tasks
- Prepare the project scope document.
- Create use case diagrams for authentication, post management, category management, analytics access, and user administration.
- Design class and ER diagrams for User, Role, Post, Category, and AuditLog.
- Map post lifecycle states and authorization boundaries.

Deliverables
- Requirement baseline document
- UML and ER diagrams
- Initial domain model and database schema draft

### 6. Phase II - Backend Development

#### Day 2 - Project Setup and Development Workflow
Objective
Establish the backend and frontend workspace, development conventions, and environment configuration.

Functional Activities
- Set up project structure for full stack development.
- Define local development standards and workflow expectations.

Tasks
- Configure the Spring Boot backend and React frontend projects.
- Define package structure, dependency management, and runtime profiles.
- Prepare local configuration for database access, JWT settings, and CORS.
- Establish version-control workflow expectations for main, dev, and feature work.

Deliverables
- Project workspace baseline
- Dependency and configuration setup
- Development workflow notes

#### Day 3 - Database and Schema Setup
Objective
Design and implement the persistence layer for application data.

Functional Activities
- Create relational schema for core content and security data.
- Define relationships and timestamps for content lifecycle tracking.

Tasks
- Create tables for users, roles, posts, categories, audit logs, and role assignments.
- Define primary keys and foreign keys.
- Implement one-to-many relationships from user to posts and category to posts.
- Support local MySQL development and H2-based test execution.

Deliverables
- Database schema
- Entity model mapping
- Development database configuration

#### Day 4 - Develop Core APIs and Business Logic
Objective
Implement backend REST APIs that drive the CMS workflows.

Functional Activities
- Build controllers, services, and repositories.
- Enforce business rules for content and user operations.

Tasks
- Implement authentication endpoints for register, login, and token refresh.
- Implement post APIs for listing, detail retrieval, creation, update, publish state changes, and deletion.
- Implement category APIs for retrieval and management.
- Implement analytics and administrative APIs.
- Add validation, error handling, and response DTOs.

Deliverables
- Core REST APIs
- Business logic services
- Request and response contracts

#### Day 5 - Authentication and Authorization
Objective
Secure the backend through Spring Security and role-based access control.

Functional Activities
- Implement identity verification and permission checks.
- Protect sensitive endpoints according to user roles.

Tasks
- Configure Spring Security filters and authentication manager.
- Generate JWT access and refresh tokens.
- Enforce method-level rules using role-aware annotations.
- Restrict category, analytics, draft, and admin endpoints to permitted roles.

Deliverables
- Authentication APIs
- JWT security implementation
- Role-restricted backend access rules

#### Day 6 - Testing and API Validation
Objective
Verify backend correctness for essential CMS scenarios.

Functional Activities
- Test secured and unsecured API behavior.
- Validate business rules and regression-sensitive workflows.

Tasks
- Write backend integration tests that interact through the HTTP API layer.
- Verify authentication, category access, post workflows, draft access, and admin restrictions.
- Confirm error handling for invalid access and invalid state changes.
- Use H2 test data and isolated profiles for repeatable execution.

Deliverables
- Backend integration test suite
- API verification results
- Regression checklist for protected workflows

### 7. Phase III - Frontend Development

#### Day 7 - Build UI Components
Objective
Develop the user interface structure and reusable presentation components.

Functional Activities
- Create layout components and reusable form controls.
- Build responsive content views for the CMS dashboard.

Tasks
- Implement navigation bar, sidebar, loading skeletons, confirmation modal, and theme toggle.
- Build reusable input, select, textarea, and password-visibility form controls.
- Create login, registration, post list, post detail, post form, category, analytics, and user-management pages.
- Apply Bootstrap-based responsive styling and shared theme tokens.

Deliverables
- Frontend layout shell
- Reusable UI components
- Responsive page templates

#### Day 8 - API Integration and State Management
Objective
Connect the React frontend to backend services and manage application state.

Functional Activities
- Integrate secured APIs into frontend workflows.
- Coordinate loading, success, and error states through centralized state management.

Tasks
- Configure Axios for authenticated API communication.
- Implement Redux slices for authentication, posts, categories, and users.
- Integrate form submission, list loading, detail retrieval, and state refresh logic.
- Handle protected routing, unauthorized redirects, and toast-based feedback.

Deliverables
- Integrated frontend application
- API communication layer
- Centralized client-side state handling

### 8. Phase IV - Advanced Features

#### Day 9 - Pagination, Filtering, and Editorial Workflow Enhancements
Objective
Improve content management efficiency and user experience.

Functional Activities
- Introduce scalable browsing and review workflows.
- Separate live content from draft content for clearer editorial control.

Tasks
- Implement pageable published-post APIs and frontend pagination controls.
- Add month-based filtering for published posts.
- Display draft posts in a dedicated review table for managers and administrators.
- Support publish and revert-to-draft actions directly from the dashboard.

Deliverables
- Pagination-enabled post listing
- Filtering support
- Draft review workflow

#### Day 10 - UI Testing and Responsiveness Fixes
Objective
Ensure a stable and usable interface across common user journeys.

Functional Activities
- Test frontend behavior and correct UI regressions.
- Improve responsive presentation and interaction feedback.

Tasks
- Write frontend tests for post creation, draft publishing, role-based rendering, form behavior, and theme controls.
- Validate navigation highlighting and unauthorized-state handling.
- Fix date formatting resilience and dark-mode presentation issues.
- Review layout behavior across desktop and smaller viewport sizes.

Deliverables
- Frontend regression test coverage
- Responsive and corrected UI behavior
- Stable editorial user experience

### 9. Phase V - Security, Release Readiness, and Operations

#### Day 11 - Security Hardening and Access Control
Objective
Refine access control rules and protect sensitive administrative operations.

Functional Activities
- Apply fine-grained authorization checks.
- Reduce risk around privileged user management.

Tasks
- Enforce role-based permissions at frontend and backend layers.
- Prevent administrator self-deactivation and direct admin-role reassignment.
- Restrict draft visibility, analytics access, and user management to the correct roles.
- Preserve audit evidence for privileged actions.

Deliverables
- Hardened access-control behavior
- Protected administrative workflows
- Auditable privileged actions

#### Day 12 - Build Verification and Release Preparation
Objective
Prepare the system for dependable validation and handoff.

Functional Activities
- Confirm that backend and frontend builds are testable and stable.
- Consolidate quality checks before release.

Tasks
- Execute backend test suites under isolated test configuration.
- Execute frontend automated tests for user-facing workflows.
- Verify development runtime for frontend and backend integration.
- Review configuration values required for deployment environments.

Deliverables
- Verified test results
- Release-readiness checklist
- Environment configuration notes

#### Day 13 - Deployment, Monitoring, and Operational Requirements
Objective
Define the operational expectations for deploying and maintaining the application.

Functional Activities
- Prepare the application for controlled deployment.
- Identify monitoring and security needs for runtime operations.

Tasks
- Externalize secrets and environment variables.
- Require HTTPS, secure token storage practices, and controlled database access.
- Enable application logging and operational monitoring.
- Define deployment targets for frontend and backend hosting.

Deliverables
- Deployment requirements
- Monitoring and logging requirements
- Operational security baseline

### 10. Acceptance Summary
The current system is considered functionally complete when users can authenticate successfully, create and manage posts according to role permissions, managers can review and publish drafts, categories can be maintained by authorized users, analytics are visible only to permitted roles, and administrators can govern non-admin users with audit visibility.

The system is considered non-functionally acceptable when core workflows remain stable under normal usage, protected routes and APIs enforce role restrictions consistently, validation errors are surfaced clearly, and automated tests cover the major editorial and administrative regressions.

### 11. Deliverables Summary
- Full stack content management application with secured REST APIs and responsive React frontend
- Role-based editorial workflow for draft creation, review, and publication
- Category management, analytics dashboard, and administrative user governance
- Automated backend and frontend test coverage for major workflows
- Environment-aware configuration and deployment-ready operational requirements