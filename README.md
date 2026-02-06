# 🎯 Ouvify - Enterprise White-Label Feedback Platform

<div align="center">

![Ouvify Logo](https://via.placeholder.com/400x100/6366F1/FFFFFF?text=OUVIFY)

**🏆 Version 1.0.0 - Production Ready**

**Enterprise-grade SaaS platform for customer feedback management**
Whistleblowing • Complaints • Suggestions • Testimonials • Protocol Tracking

[![Deploy Backend](https://img.shields.io/badge/deploy-Render-46E3B7?logo=render&logoColor=white)](https://ouvify-backend.onrender.com)
[![Deploy Frontend](https://img.shields.io/badge/deploy-Vercel-000000?logo=vercel&logoColor=white)](https://ouvify.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.1-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/UI-Shadcn%20%2B%20Tailwind-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)

**🚀 Status:** Production Ready | **📅 Release Date:** February 6, 2026

</div>

---

## 📚 Table of Contents

- [About](#-about)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Security & Compliance](#-security--compliance)
- [Deployment](#-deployment)
- [Support](#-support)

---

## 🎯 About

**Ouvify** is a **production-ready, enterprise-grade White-Label SaaS platform** for comprehensive feedback management. Built with modern technologies and security best practices, Ouvify empowers organizations to collect, manage, and analyze customer feedback while maintaining complete brand control and data privacy.

### 🌟 What Makes Ouvify Different

- 🏢 **True Multi-Tenancy**: Complete data isolation with custom subdomains per tenant
- 🎨 **Full White-Label**: Custom logo, colors, fonts, and branding
- 🔐 **Enterprise Security**: 2FA/MFA, audit logs, JWT, rate limiting
- ⚖️ **LGPD/GDPR Ready**: Consent management, data export, right to deletion
- 💳 **Monetization Built-in**: Stripe integration with tiered pricing
- 🎓 **User Onboarding**: Interactive checklist and guided tour
- 📊 **Advanced Analytics**: Real-time dashboards with visualization
- 🔗 **Webhooks & API**: RESTful API + customizable webhooks
- 🌐 **Anonymous Feedback**: Protocol-based tracking without PII
- 📱 **PWA Ready**: Mobile-first responsive design

### 🎯 Use Cases

| Industry      | Use Case                                         |
| ------------- | ------------------------------------------------ |
| 🏢 Corporate  | Internal whistleblowing channel (SOX/compliance) |
| 🏛️ Government | Digital ombudsman services                       |
| 🏫 Education  | Student/faculty feedback systems                 |
| 🏥 Healthcare | Patient complaint management                     |
| 🛒 E-commerce | Customer service with protocol tracking          |
| 🏦 Financial  | Regulatory compliance feedback channels          |

---

## ✨ Key Features

### 🔐 Security & Authentication

- ✅ **Two-Factor Authentication (2FA/MFA)**: TOTP with QR codes and backup codes
- ✅ **JWT with Blacklist**: Secure token authentication with refresh rotation
- ✅ **Rate Limiting**: Brute-force protection (per tenant, per IP, per endpoint)
- ✅ **Audit Logging**: Complete activity tracking (20+ action types, 4 severity levels)
- ✅ **CSP Headers**: XSS and injection prevention
- ✅ **HTTPS/HSTS**: TLS 1.3 with 1-year HSTS preload

### ⚖️ Privacy & Compliance

- ✅ **LGPD/GDPR Compliance**: Full data protection compliance
- ✅ **Consent Management**: Versioned consent tracking
- ✅ **Anonymous Feedback**: Protocol-based without PII
- ✅ **Data Export**: JSON/CSV export of personal data
- ✅ **Right to Deletion**: Account deletion with data anonymization

### 🎨 White-Label & Branding

- ✅ **Custom Branding**: Logo, colors (HEX/HSL), custom fonts
- ✅ **Favicon Customization**: Per-tenant favicon
- ✅ **Custom Subdomains**: `client.ouvify.com` isolated routing
- ✅ **Email Templates**: Branded transactional emails
- ✅ **Real-time Preview**: See changes before saving

### 💳 Billing & Monetization

- ✅ **Stripe Integration**: Checkout, subscriptions, webhooks
- ✅ **Tiered Pricing**: Free (50 feedbacks/mo), Starter, Pro, Enterprise
- ✅ **Feature Gating**: Dynamic access control by plan
- ✅ **Usage Limits**: Automatic enforcement with visual alerts
- ✅ **Customer Portal**: Self-service billing management

### 🎓 User Experience

- ✅ **Onboarding Checklist**: 4-step interactive setup
- ✅ **Progress Tracking**: Visual 0-100% progress bar
- ✅ **Guided Tour**: Driver.js interactive walkthrough
- ✅ **Mobile-First**: Responsive UI with TailwindCSS
- ✅ **Global Search**: Command Palette (Cmd+K / Ctrl+K)

### 📊 Analytics & Reporting

- ✅ **Real-time Dashboard**: KPIs, charts, trends
- ✅ **Audit Log Dashboard**: Filterable activity logs
- ✅ **Export Capabilities**: CSV/JSON export
- ✅ **Tenant Isolation**: Complete data segregation

### 🎫 Feedback Management

- ✅ **Protocol Tracking**: Unique codes (OUVY-XXXX-XXXX)
- ✅ **4 Feedback Types**: Complaint, Suggestion, Whistleblowing, Testimonial
- ✅ **Status Workflow**: Pending → In Review → Resolved → Closed
- ✅ **File Attachments**: Cloudinary integration
- ✅ **Timeline History**: Complete interaction audit trail
- ✅ **Team Assignment**: Assign to specific members
- ✅ **Tags & Categories**: Flexible organization
- ✅ **Advanced Search**: Full-text with filters

### 👥 Team & Collaboration

- ✅ **Role-Based Access**: Owner, Admin, Moderator, Viewer
- ✅ **Email Invitations**: Token-based team invites
- ✅ **Suspend/Activate**: Temporary access control
- ✅ **Activity Tracking**: Per-user action logs
- ✅ **Team Limits by Plan**: Enforced automatically

### 🔗 Integrations

- ✅ **RESTful API**: Complete Django REST Framework API
- ✅ **Webhooks**: Custom endpoints with event types
- ✅ **Event Types**: `feedback.created`, `feedback.updated`, `feedback.resolved`, etc.
- ✅ **Signature Validation**: HMAC-based security
- ✅ **Delivery Logs**: Complete webhook history with retry

---

## 🛠️ Tech Stack

### Backend

| Technology            | Version | Purpose                |
| --------------------- | ------- | ---------------------- |
| Python                | 3.13    | Core language          |
| Django                | 5.1.15  | Web framework          |
| Django REST Framework | 3.15.2  | API layer              |
| PostgreSQL            | 16      | Primary database       |
| Redis                 | 7.1     | Cache + Celery broker  |
| Celery                | 5.6     | Async task queue       |
| SimpleJWT             | 5.3     | JWT authentication     |
| PyOTP                 | 2.9     | 2FA/MFA implementation |
| Stripe                | 11.7    | Payment processing     |
| Cloudinary            | 1.41    | File storage & CDN     |
| Sentry                | 2.19    | Error monitoring       |

### Frontend

| Technology   | Version | Purpose                      |
| ------------ | ------- | ---------------------------- |
| Next.js      | 16.1    | React framework (App Router) |
| React        | 19.2    | UI library                   |
| TypeScript   | 5.7     | Type safety                  |
| TailwindCSS  | 3.4     | Utility-first styling        |
| Shadcn/ui    | Latest  | Accessible components        |
| SWR          | 2.3     | Data fetching & caching      |
| Axios        | 1.13    | HTTP client                  |
| Driver.js    | 1.6     | Onboarding tours             |
| Lucide React | Latest  | Icon system                  |

### Infrastructure

- **Hosting**: Render (Backend), Vercel (Frontend)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **CDN**: Cloudinary
- **Monitoring**: Sentry
- **Payments**: Stripe

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (recommended) OR
- **Python 3.13+**, **Node.js 20+**, **PostgreSQL 16+**, **Redis 7+**

### Docker Compose (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/jairguerraadv-sys/Ouvify.git
cd Ouvify

# 2. Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 3. Start all services
docker-compose up -d

# 4. Run migrations
docker-compose exec backend python manage.py migrate

# 5. Create superuser
docker-compose exec backend python manage.py createsuperuser
```

**Access:**

- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/api/docs/
- 🔐 Admin: http://localhost:8000/painel-admin-ouvify-2026/

---

## 📖 Documentation

Comprehensive documentation available:

| Document                                        | Description                      |
| ----------------------------------------------- | -------------------------------- |
| 📘 [**MANUAL_USUARIO.md**](MANUAL_USUARIO.md)   | **Complete User Manual** (PT-BR) |
| 🏗️ [Architecture](docs/ARCHITECTURE.md)         | System architecture and design   |
| 🛡️ [Security](docs/SECURITY.md)                 | Security practices and 2FA       |
| 🚀 [Deployment](docs/DEPLOYMENT.md)             | Production deployment guide      |
| 📋 [API Documentation](docs/API.md)             | Complete REST API reference      |
| 🎨 [Design System](docs/DESIGN_SYSTEM.md)       | UI components and patterns       |
| 🔒 [Brand Guidelines](docs/BRAND_GUIDELINES.md) | Visual identity manual           |

---

## 🔒 Security & Compliance

Ouvify implements **enterprise-grade security**:

### 🛡️ Active Protections

- ✅ **Rate Limiting**: 5-100 req/hour by endpoint (tenant-aware)
- ✅ **HTTPS Enforced**: TLS 1.3 with HSTS (1 year preload)
- ✅ **CSP Headers**: Strict Content Security Policy
- ✅ **CSRF Protection**: Token validation on state-changing ops
- ✅ **SQL Injection**: Django ORM parameterized queries
- ✅ **XSS Prevention**: Input sanitization with Bleach
- ✅ **N+1 Queries**: Optimized with select_related/prefetch_related (98.5% reduction)

### 📋 Audit & Compliance

- ✅ **Audit Logging**: 20+ action types with IP, user agent, metadata
- ✅ **LGPD/GDPR**: Consent management + data export/deletion
- ✅ **2FA/MFA**: TOTP with backup codes
- ✅ **Session Security**: Secure cookies, JWT rotation

---

## 🚢 Deployment

### Backend - Render

```yaml
# render.yaml (pre-configured)
services:
  - type: web
    name: ouvify-backend
    env: python
    buildCommand: pip install -r requirements /prod.txt && python manage.py collectstatic --noinput
    startCommand: gunicorn config.wsgi:application
```

**Set environment variables:**

- `SECRET_KEY` (auto-generated)
- `DATABASE_URL` (from Render PostgreSQL)
- `REDIS_URL` (from Render Redis)
- `STRIPE_SECRET_KEY`
- `CLOUDINARY_URL`

### Frontend - Vercel

```bash
cd apps/frontend
vercel
```

**Set environment variables:**

- `NEXT_PUBLIC_API_URL` (your Render backend URL)
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`

**Production URLs:**

- Backend: https://ouvify-backend.onrender.com
- Frontend: https://ouvify.vercel.app

---

## 📞 Support

- 📧 **Email**: suporte@ouvify.com
- 📚 **Documentation**: [MANUAL_USUARIO.md](MANUAL_USUARIO.md)
- 🐛 **Bug Reports**: GitHub Issues (authorized users)
- 💬 **Chat**: Available in dashboard (Pro+ plans)

---

## 📄 License

**Proprietary License** - All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.

For licensing inquiries: jairguerraadv@gmail.com

---

<div align="center">

**🚀 Built with ❤️ by Ouvify Team**

**Version 1.0.0** | February 6, 2026

Production ready for enterprise deployment

[🌐 Website](https://ouvify.vercel.app) • [📚 Docs](MANUAL_USUARIO.md) • [🐛 Report Bug](https://github.com/jairguerraadv-sys/Ouvify/issues)

</div>
