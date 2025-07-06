Copilot Instructions – Bitcorp ERP: Civil Works Equipment Management Platform

🧭 Purpose

These instructions provide GitHub Copilot with guidance on how to assist in developing Bitcorp ERP, a modern civil engineering equipment and operator management system. The application will serve planning engineers, cost engineers, HR, and field operators with both web and mobile interfaces.

Additionally, Copilot should generate in-depth explanations for each implementation it suggests, suitable for a junior developer preparing for interviews. These should include:
	•	Why a specific library or pattern is used
	•	Architectural decisions
	•	Performance and scalability trade-offs
	•	Security and testing implications
	•	Related software engineering principles (SOLID, DRY, YAGNI, etc.)
	•	Short Q&A to reinforce learning
	•	Reference to relevant books in the `/books` folder
	•	Deployment considerations for Synology NAS
	•	How to write clean, maintainable code


	I am also reading the books in the list below to prepare for interviews, pdf in the `/books` folder:
		•	"Clean code in Python" by Mariano Anaya
		•	"Designing Data-Intensive Applications" by Martin Kleppmann
		•	"Elements of Programming Interviews" by Adnan Aziz, Tsung-Hsien Lee, Amit Prakash
		•	"Object-Oriented Basics - Grokking the object oriented design interview"
		•	"Building Large Scale Web Apps. A React Field Guide" by Osmani A.
		•	"Patterns of Enterprise Application Architecture" by Martin Fowler
		•	"React Interview Guide" by Sudheer Jonna, Andrew Baisden
		•	"Refactoring: Improving the Design of Existing Code" by Martin Fowler
		•	"SQL Antipatterns" by Bill Karwin
		•	"Refactoring UI: The Book" by Adam Wathan, Steve Schoger
		•	"Clean Code" by Robert C. Martin
		•	"Clean Coder - A Code of Conduct for Professional Programmers" by Robert C. Martin
		•	"API Design Patterns" by JJ Geewax
		•	"Domain-Driven Design: Tackling Complexity in the Heart of Software" by Eric Evans
		•	"Pure React" by Dave Ceddia
		•	"React Design Patterns and Best Practices" by Michele Bertoli
	So, Copilot should also reference these books where relevant to reinforce concepts.
		

Deployment Context:

The entire codebase will be deployed on a Synology NAS. Ensure all Docker, volume, and runtime scripts are compatible with a Synology Docker environment. Include documentation and compatibility advice specific to Synology’s DSM.

⸻

📦 Technology Stack
	•	Frontend (Desktop + Admin): ReactJS (TypeScript) + (Material UI)[https://mui.com/material-ui/getting-started/installation/] + (Next.js)[https://nextjs.org/docs/getting-started] + (React Query)[https://tanstack.com/query/latest/overview]
	•	Mobile App: Responsive PWA built in ReactJS
	•	Backend: Python with (FastAPI)[https://fastapi.tiangolo.com/], (Celery)[https://docs.celeryproject.org/en/stable/index.html] for async tasks and (SQLAlchemy)[https://docs.sqlalchemy.org/en/20/index.html] for ORM, (Pydantic)[https://docs.pydantic.dev/latest/] for data validation, (mypy)[https://mypy.readthedocs.io/en/stable/] for type checking
	•	Distributed Computing (Optional): (Ray.io)[https://docs.ray.io/en/latest/] for scheduling/optimization algorithms
	•	Database: PostgreSQL + (Alembic)[https://alembic.sqlalchemy.org/en/latest/] (migrations)
	•	Cache/Broker: (Redis)[https://redis.io/docs/latest/]
	•	Infrastructure: Docker, Kubernetes, GitHub Actions (CI/CD)
	•	Testing: (pytest)[https://docs.pytest.org/en/stable/] for Python, (React Testing Library)[https://testing-library.com/docs/react-testing-library/intro/] + (Jest)[https://jestjs.io/docs/getting-started] for React
	•	Authentication: OAuth2 with JWT tokens, Playwright for end-to-end testing
	•	Monitoring: (Prometheus)[https://prometheus.io/docs/introduction/overview/] for metrics, (Grafana)[https://grafana.com/docs/grafana/latest/] for visualization, (Sentry)[https://docs.sentry.io/platforms/python/guides/fastapi/] for error tracking
	•	Documentation: Markdown files in `/docs`, API docs via FastAPI's built-in OpenAPI support
	•	Localization: (i18next)[https://www.i18next.com/] for frontend, (FastAPI i18n)[https://fastapi.tiangolo.com/advanced/i18n/] for backend
	•	Rate Limiting: (FastAPI Limiter)[https://github.com/Abdur-rahmaanJ/FastAPI-Limiter]
	•	Role-Based Access Control (RBAC): Implemented via FastAPI dependencies and OAuth2 scopes
	•	File Handling: (FastAPI File Uploads)[https://fastapi.tiangolo.com/tutorial/file-uploads/]
	•	Environment Configuration: Use `.env` files with (python-dotenv)[https://pypi.org/project/python-dotenv/] for local development, and
		configuration management in production (e.g., Kubernetes secrets, Docker secrets), Poetry for Python dependency management, and
		(Direnv)[https://direnv.net/] for environment variable management, Pyenv for Python virtual environments
	•	Offline Support: Service workers for PWA, IndexedDB for local storage
	•	Real-time Updates: WebSockets for real-time notifications (e.g., job status updates)
	•	CI/CD: Use (GitHub Actions)[https://docs.github.com/en/actions] for continuous integration and deployment, with workflows for linting, testing, and building Docker images
	•	Deployment: Use (Docker Compose)[https://docs.docker.com/compose/] for local development, and (Helm)[https://helm.sh/docs/] for Kubernetes deployments
	•	Internationalization: Should support multiple languages using (i18next)[https://www.i18next.com/] for the frontend and (FastAPI i18n)[https://fastapi.tiangolo.com/advanced/i18n/] for the backend atleast English and Spanish (Latin)
	•	Husky: Use (Husky)[https://typicode.github.io/husky/#/] for Git hooks to enforce code quality checks before commits
	•	Prettier: Use (Prettier)[https://prettier.io/] for consistent code formatting across the project
	•	Linting: Use (ESLint)[https://eslint.org/] for JavaScript/TypeScript linting, (Flake8)[https://flake8.pycqa.org/en/latest/] for Python linting, and (Black)[https://black.readthedocs.io/en/stable/] for Python code formatting
	•	pre-commit: Use (pre-commit)[https://pre-commit.com/] to manage and run pre-commit hooks for code quality checks, including linting, formatting, and security checks
	•	Visualization: Use (Chart.js)[https://www.chartjs.org/] for data visualization in the frontend, and (FullCalendar)[https://fullcalendar.io/] for scheduling views
	•	Accessibility: Ensure the frontend is accessible (WCAG 2.1 compliant)
	•	Performance Optimization: Use (Lighthouse)[https://developers.google.com/web/tools/lighthouse] for performance audits, and implement best practices for frontend performance (e.g., code splitting, lazy loading, image optimization)

⸻

📁 Project Structure Template

root/
├── frontend/              # React (admin + mobile PWA)
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── styles/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI routes
│   │   ├── models/        # SQLAlchemy + Pydantic
│   │   ├── services/      # Business logic
│   │   ├── workers/       # Celery & Ray tasks
│   │   └── schemas/
│   ├── alembic/           # DB migrations
│   └── main.py            # FastAPI entrypoint
├── scripts/               # Seeder, data loaders
├── k8s/                   # Kubernetes manifests
└── docker-compose.yml


⸻

🎯 Module Coverage & Instructions

Equipment Management
	•	Create Equipment model: equipment_id, type, status, location, hourmeter, odometer
	•	Implement assignment logic between equipment and sites with FastAPI endpoints
	•	Use Redis + Celery to schedule/track async equipment reassignments
	•	Track equipment utilization in backend and expose via /api/equipment/utilization for dashboard
	•	Use SQLAlchemy for ORM, Pydantic for data validation, and Alembic for migrations
	•	Use Redis for caching frequently accessed data (e.g., equipment status)
	•	Use Ray.io for distributed scheduling and optimization of equipment assignments
	•	Use WebSockets for real-time updates on equipment status changes

💡 For each endpoint and model, Copilot must include inline comments and markdown-style notes explaining:
	•	How SQLAlchemy/Pydantic is used and why
	•	The API design pattern being followed (RESTful best practices)
	•	Any performance considerations (indexing, caching)
	•	How to handle concurrent updates (optimistic locking, transactions)
	•	Why Redis is used for caching and task queuing
	•	How Ray.io can optimize scheduling and resource allocation
	•	How WebSockets can provide real-time updates and the trade-offs vs. polling
	•	How to write clean, maintainable code with proper separation of concerns
	•	How to write unit tests for the models and endpoints
	•	How to handle migrations with Alembic and why they are important
	•	How to ensure data integrity and validation using Pydantic
	•	How to structure the project for scalability and maintainability
	•	How to handle error responses and logging in FastAPI
	•	How to document the API using OpenAPI/Swagger in FastAPI
	•	How to implement role-based access control (RBAC) for sensitive endpoints
	•	How to use environment variables for configuration (e.g., database URLs, Redis settings)
	•	How to set up Docker for development and production environments
	•	How to use GitHub Actions for CI/CD, including linting, testing, and deployment
	•	How to ensure compatibility with Synology NAS Docker environment
	•	How to handle file uploads/downloads securely (e.g., for equipment manuals)
	•	How to implement pagination and filtering for large datasets
	•	How to handle localization and internationalization (i18n) for multi-language support
	•	How to implement rate limiting and throttling for API endpoints
	•	How to implement logging and monitoring for the backend services
	etc.

Operator Management
	•	Define Operator model with skills, certifications, availability
	•	Link operators to equipment using skill-based matching (use Ray.io or rules-based logic)
	•	Expose CRUD for operator profiles via FastAPI + secured endpoints
	•	Use WebSockets or polling for job notifications
	•	Implement skill-matching algorithm (rules-based or ML) to assign operators to jobs

💡 Copilot should explain:
	•	Why WebSockets may be preferred over polling in this case
	•	What makes a good skill-matching algorithm (rules vs ML)
	•	How to handle access control for protected resources
	•	How to structure operator profiles for extensibility (e.g., adding new skills)
	•	How to implement efficient search/filtering for operators
	•	How to handle operator availability updates in real-time
	•	How to implement notifications for job assignments and updates
	•	How to ensure data integrity when linking operators to equipment
	•	How to implement role-based access control (RBAC) for operator management
	•	How to use FastAPI dependencies for authentication and authorization
	etc.

Daily Reports (Mobile)
	•	Implement /api/report/submit for submitting usage logs (start/stop, fuel, meter readings)
	•	Design PWA interface for operators with: Start/Stop Logging, Fuel Entry, Daily Summary
	•	Enable offline-first mode using service workers and sync logic

💡 Explain:
	•	How service workers enable offline-first architecture
	•	How to sync queued data safely and resolve conflicts
	•	The mobile UX decisions (e.g., minimal input, fast nav)
	•	How to handle large data submissions efficiently
	•	How to validate and sanitize user input
	•	How to implement error handling and retries for failed submissions
	•	How to ensure data integrity when syncing offline data
	•	How to implement push notifications for job updates
	•	How to structure the PWA for performance and responsiveness
	•	How to use IndexedDB for local storage of reports
	•	How to implement accessibility features for mobile users
	etc.

Scheduling
	•	Implement intelligent equipment/operator scheduling service (Ray.io or heuristics)
	•	Store historical schedules in schedules table with links to projects, operators, and equipment
	•	Visualize daily schedule in admin dashboard (React + FullCalendar or similar)

💡 Copilot must explain:
	•	Why distributed scheduling might be needed
	•	When to choose Ray vs simple task queues
	•	The trade-offs between pre-computed and on-demand schedules
	•	How to handle scheduling conflicts and retries
	•	How to optimize scheduling algorithms for performance
	•	How to implement caching for frequently accessed schedules
	•	How to structure the scheduling service for scalability
	•	How to implement role-based access control (RBAC) for scheduling features
	•	How to use FastAPI dependencies for authentication and authorization
	•	How to implement logging and monitoring for scheduling tasks
	etc.

Cost Analysis
	•	Create API to calculate hourly usage costs per operator and equipment
	•	PDF generation endpoint /api/reports/valuation/pdf using WeasyPrint or similar
	•	Auto-calculate operator salaries from timesheets with rules (rate x hours)

💡 Copilot should include:
	•	Why PDF generation is useful (print/export workflows)
	•	Salary calculation strategies and edge cases (bonuses, overtime)
	•	Data integrity checks and validation tips
	•	How to handle large datasets efficiently
	•	How to implement caching for frequently accessed cost data
	•	How to structure the cost analysis service for scalability
	•	How to implement role-based access control (RBAC) for cost analysis features
	•	How to use FastAPI dependencies for authentication and authorization
	•	How to implement logging and monitoring for cost analysis tasks 
	etc.

⸻

🧪 Testing Strategy
	•	Use pytest for Python backend, with httpx.AsyncClient for endpoint testing
	•	Use React Testing Library + Jest for frontend unit testing
	•	End-to-end tests with Playwright or Cypress for mobile PWA flow

💡 Explain:
	•	Why you write specific test cases
	•	When to mock dependencies (e.g., Redis, DB)
	•	How to test offline mobile functionality
	•	How to structure tests for maintainability
	•	How to use fixtures for setup/teardown
	•	How to handle asynchronous code in tests
	•	How to test WebSocket interactions
	•	How to implement snapshot testing for React components
	•	How to use coverage tools (e.g., pytest-cov, Istanbul) to measure test coverage
	•	How to write integration tests for API endpoints
	•	How to use GitHub Actions for running tests in CI/CD
	•	How to ensure tests are idempotent and isolated
	•	How to handle test data setup and teardown
	•	How to implement test-driven development (TDD) practices
	etc.

⸻

🔁 Copilot Guidance Prompts
	•	“Create FastAPI POST endpoint to assign equipment to project.”
	•	“Build operator matching algorithm using skill and availability.”
	•	“Generate Alembic migration for adding hourmeter to Equipment.”
	•	“Design a Celery task to recompute daily utilization stats.”
	•	“Build React component for Operator Daily Log submission.”

🧠 In each prompt, Copilot must include:
	•	Step-by-step code reasoning
	•	Study notes about why choices were made
	•	Short interview Q&A based on the snippet (e.g. “What is a Pydantic model and why is it used?”)
	•	Reference to relevant books in the `/books` folder
	•	Some analogies or metaphors to explain complex concepts
	•	Further reading suggestions (e.g., “Read about FastAPI dependencies in the FastAPI docs”)
	etc.

⸻

🔒 Security & Auth
	•	Use OAuth2 with JWT for token-based authentication
	•	Add role-based access controls: HR, Engineer, Operator
	•	Ensure endpoints like /api/report/submit are secured by role

💡 Explain:
	•	What is JWT and how is it verified?
	•	How to enforce RBAC in FastAPI with dependency injection
	•	How to handle token expiration and refresh
	•	How to secure sensitive endpoints with OAuth2 scopes
	•	How to implement secure password hashing (e.g., bcrypt)
	•	How to protect against common web vulnerabilities (e.g., XSS, CSRF, SQL Injection)
	•	How to use HTTPS in production for secure communication
	•	How to implement logging and monitoring for security events
	•	How to handle sensitive data (e.g., API keys, secrets) securely
	•	How to use environment variables for configuration (e.g., database URLs, Redis settings)
	•	How to set up Docker secrets for sensitive information
	•	How to use GitHub Secrets for CI/CD pipelines
	•	How to implement rate limiting and throttling for API endpoints
	•	How to implement logging and monitoring for security events
	•	How to handle CORS (Cross-Origin Resource Sharing) securely
	•	How to implement input validation and sanitization
	•	How to use security headers (e.g., Content Security Policy, X-Content-Type-Options)
	•	How to implement secure file uploads/downloads
	•	How to use Sentry for error tracking and monitoring security issues
	•	How to implement secure session management
	•	How to handle user authentication and authorization securely
	•	How to implement secure password storage and hashing
	•	How to implement secure API key management
	•	How to implement secure data storage and encryption
	•	How to implement secure logging practices
	•	How to implement secure deployment practices (e.g., Docker, Kubernetes)
	•	How to implement secure API design patterns
	•	How to implement secure data transmission (e.g., HTTPS, TLS)
	•	How to implement secure data storage (e.g., encryption, access controls)
	•	How to implement secure data access patterns
	•	How to implement secure data processing patterns
	etc.

⸻

📊 Monitoring
	•	Include structured logging (uvicorn, logging) in backend
	•	Expose Prometheus metrics endpoint /metrics
	•	Log API response times, failure rates, and worker job stats

💡 Document:
	•	Why observability is critical for production systems
	•	What metrics to monitor for async tasks
	•	How to set up Grafana dashboards for visualizing metrics
	•	How to use Sentry for error tracking and performance monitoring
	•	How to implement distributed tracing (e.g., OpenTelemetry)
	•	How to handle log rotation and retention policies
	•	How to implement alerting based on metrics (e.g., Prometheus Alertmanager)
	•	How to use logging libraries effectively (e.g., structlog, loguru)
	•	How to implement log aggregation (e.g., ELK stack, Fluentd)
	•	How to implement log analysis and visualization
	•	How to implement log correlation for distributed systems
	•	How to implement log monitoring and alerting
	•	How to implement log retention and archival
	•	How to implement log security and compliance
	•	How to implement log performance optimization
	•	How to implement log error handling and recovery
	•	How to implement log debugging and troubleshooting
	•	How to implement log testing and validation
	•	How to implement log documentation and best practices
	•	How to implement log versioning and migration
	•	How to implement log performance tuning and optimization
	•	How to implement log security and compliance
	•	How to implement log monitoring and alerting
	•	How to implement log analysis and visualization
	•	How to implement log aggregation and correlation
	•	How to implement log retention and archival
	etc.

⸻

🌐 Deployment
	•	Use Docker for all services
	•	Create Helm charts for Kubernetes deployment
	•	Set up GitHub Actions to lint, test, and deploy (CI/CD)
	•	Ensure Docker Compose configuration is compatible with Synology DSM’s Docker UI
	•	Include .env support, bind-mounts for Synology volumes, log folder mapping

💡 Copilot must provide:
	•	docker-compose.yml optimized for Synology NAS
	•	File permission considerations (UID, GID)
	•	Local .env and config.json that can be overridden
	•	How to set up Synology Docker volumes for persistent storage
	•	How to handle Synology-specific networking (ports, IPs)
	•	How to use Synology’s Docker UI for managing containers

⸻

💡 Design Philosophy
	•	Mobile-first UI for operators (quick log submission, simple actions)
	•	Rich dashboards for admin (equipment maps, utilization heatmaps)
	•	Robust async task processing for reporting, cost calc, and analytics
	•	Real-time updates via WebSockets or polling

⸻

💡 Important Notes:
 - Consider checking the following folders for inspiration:
		•	`/old_code/`
		•	`/books/`
		•	`/docs/`
 - Don't update the `/docs/` or the `/old_code/` folder, it is for reference only.
 - Add notes and references to the `/docs/` folder, not the `/old_code/` folder.
 - Reference the `/books/` folder for relevant books and resources.
 - Check the prd.instructions.md file for the latest project requirements and updates.
 - Build the application incrementally, starting with the core features and expanding to advanced functionalities.
 - Document each step thoroughly, including code explanations, architectural decisions, and performance considerations and add them to the `/docs/` folder.
 - Use the `/docs/` folder to provide detailed explanations, learning prompts, and interview preparation
 - Ensure all code is compatible with Synology NAS Docker environment, including deployment scripts and configurations.
 - Every feature implemented should include detailed commentary and learning prompts to support the user’s growth as a full stack engineer.
 - Add the relevant code and commit and push it to the repository.
 - Use conventional commit messages for all changes, following the format: `feat: <description>`, `fix: <description>`, `docs: <description>`, etc. Keep the commit messages concise and descriptive.
 - Use the Bitcorp.sql file within the db folder to generate the initial database schema and add dummy data for the Bitcorp ERP civil works platform.
 - Keep in mind that I only speak English, so all comments, documentation, and code should be in English. However, you can use Spanish for the database schema and dummy data if needed, as it is a common language in the civil works industry. Also, the application is targeted for a Spanish-speaking audience, so the frontend should support both English and Spanish localization.
 - I would appreciate it if you could provide detailed explanations for each implementation, including the reasoning behind design choices, performance considerations, and security implications. This will help me understand the code better and prepare for interviews.
 - Also, create a new branch for each feature or bug fix, following the naming convention `feature/<description>` or `bugfix/<description>`. This will help keep the main branch clean and organized. Also, add some nice PR descriptions for each PR, summarizing the changes made, the reasoning behind them, and any relevant links or references.
 - Update the Readme.md file in the root directory with a summary of the project, installation instructions, and usage examples. This will help new developers get started quickly and understand the project structure.
 - Before pushing the code, ensure the builds are passing and all tests are successful. Use GitHub Actions to automate the testing and deployment process, ensuring that the code is always in a deployable state.
 - Maintain a changelog file in the root directory to track changes, features, and bug fixes. This will help keep the project organized and make it easier to understand the evolution of the codebase.
 - I am using copilot to help me with the development, so please ensure that all code is well-structured, modular, and follows best practices. This will make it easier for me to understand and learn.
 - Give me references and resources to learn from as I go along, including links to relevant documentation, tutorials, and articles. This will help me deepen my understanding of the technologies used in the project.
 - Feel free to quiz me on the concepts and technologies used in the project, as this will help reinforce my learning and prepare me for interviews.
 - Make sure to document any known issues, limitations, or areas for improvement in the project along with decisions made, their reasons and any alternatives worth looking into. This will help me understand the current state of the codebase and identify areas that need attention.


Copilot: Use this file to generate consistent backend logic, clean frontend components, test coverage, and deployment automation for the Bitcorp ERP civil works platform. Additionally, provide detailed commentary and learning prompts throughout to support the user’s growth as a full stack engineer preparing for interviews. All deployment guidance must account for compatibility with Synology NAS Docker environment.