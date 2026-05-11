# Sadak Saathi — Autonomous Pothole Intelligence Platform

## 1. Vision & Purpose

Sadak Saathi ("Road Companion") is an AI-powered road infrastructure monitoring platform that transforms citizen reports, vehicle cameras, and CCTV feeds into actionable intelligence for government road maintenance departments. The platform auto-detects potholes using YOLOv8, routes complaints to appropriate departments, and tracks repair workflows to completion.

**Core Promise:** Turn every citizen's phone into a road inspection tool, every dashcam into a sensor, and every complaint into tracked government action.

---

## 2. Problem Statement

| Problem | Impact |
|----------|--------|
| Citizens report potholes but complaints get lost in bureaucracy | 73% of urban road complaints never get addressed |
| No standardized severity scoring | Departments can't prioritize repairs |
| Manual inspection is slow and expensive | 1 inspector covers ~50km/day |
| No aggregate city-wide road health data | Budget allocation is political, not data-driven |
| Fake/spam reports waste government resources | Departments ignore citizen reports |
| No repair verification mechanism | "Fixed" roads remain broken |

---

## 3. Success Metrics (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Detection Precision | >92% | Human-verified sample set |
| Complaint Resolution Rate | >80% within 30 days | Firestore complaint status |
| Avg Detection Latency | <2 seconds/frame | Celery task metrics |
| Dashboard Load Time | <3 seconds | Firebase Performance |
| Map Render Time | <2 seconds | Lighthouse CI |
| Citizen Engagement | 50k monthly reports | Analytics event tracking |
| False Positive Rate | <8% | Moderation queue stats |

---

## 4. Technology Stack

### Frontend (Web + Mobile Ready)
```
Framework:      Next.js 15+ (App Router)
Language:       TypeScript 5.5+
Styling:        TailwindCSS 4.x + shadcn/ui
Maps:           Leaflet 1.9+ (mobile-friendly) / Mapbox GL JS
Charts:         Recharts 2.x
State:          Zustand (global) + TanStack Query (server)
Auth:           Firebase Auth (OTP + Google)
Hosting:        Vercel (auto-deploy from main)
```

### Backend (Flask API)
```
Language:       Python 3.11+
Framework:      Flask 3.x + Flask-RESTX
Queue:          Celery 5.x + Redis 7.x
ML Runtime:     PyTorch 2.x + OpenCV 4.x
Model:          YOLOv8 (Ultralytics)
Server:         Gunicorn (4 workers)
Hosting:        Render/GCP Cloud Run
```

### Firebase (MANDATORY)
```
Auth:           Firebase Auth (OTP, Email, Google)
Database:       Cloud Firestore
Storage:        Firebase Storage
Functions:      Cloud Functions (Node.js 20)
Messaging:      Cloud Messaging (FCM)
Analytics:      Firebase Analytics
Remote Config:  Remote Config
Hosting:        Firebase Hosting (fallback)
```

### DevOps
```
Container:      Docker + Docker Compose
CI/CD:          GitHub Actions
IaC:            Terraform (GCP)
Monitoring:     Grafana + Prometheus
Logging:        Google Cloud Logging
```

---

## 5. User Personas

### 5.1 Citizen (Primary User)
- **Profile:** Urban commuter, daily traveler, local resident
- **Needs:** Quick report without friction, track complaint status, feel heard
- **Pain:** Long-form complaint forms, no feedback loop, unresponsive government
- **Tech:** Mobile-first, 4G connectivity, limited data

### 5.2 Road Inspector (Field Agent)
- **Profile:** Government employee, uses app daily for verification
- **Needs:** Queue of nearby unreviewed reports, quick verification tools, offline mode
- **Pain:** Manual paperwork, no GPS logging, disconnected systems
- **Tech:** Tablet + slow network

### 5.3 Government Officer (Decision Maker)
- **Profile:** District Engineer, PWD officer, Municipal Commissioner
- **Needs:** Aggregated analytics, heatmap views, jurisdiction dashboard, budget reports
- **Pain:** No data-driven decisions, manual report compilation, no trends
- **Tech:** Desktop-first, expects enterprise quality

### 5.4 AI Moderation System
- **Profile:** Automated system with human backup
- **Needs:** Queue of pending detections, confidence scoring, bulk actions
- **Rules:** Flags <70% confidence, geo-out-of-bounds, duplicate location

### 5.5 Super Admin
- **Profile:** Platform administrator, system overseer
- **Needs:** User management, audit logs, system health, feature flags
- **Access:** Full read/write across all collections

---

## 6. Feature Matrix

| Feature | Citizen | Inspector | Officer | Admin |
|---------|---------|-----------|---------|-------|
| Report pothole | ✓ | ✓ | - | ✓ |
| Camera scan | ✓ | ✓ | - | ✓ |
| View map | ✓ | ✓ | ✓ | ✓ |
| Track complaints | ✓ | ✓ | ✓ | ✓ |
| Verify reports | - | ✓ | ✓ | ✓ |
| Assign jurisdiction | - | - | ✓ | ✓ |
| Analytics dashboard | - | - | ✓ | ✓ |
| Heatmap view | - | - | ✓ | ✓ |
| Moderation queue | - | - | - | ✓ |
| User management | - | - | - | ✓ |
| Audit logs | - | - | ✓ | ✓ |

---

## 7. Project Scope Phases

### Phase 1 — MVP (Weeks 1-4)
- Firebase project setup with Auth + Firestore
- Citizen web app with OTP login
- Basic upload/report flow
- Simple Leaflet map with markers
- Mock detection API (no real ML)
- Complaint tracking timeline

### Phase 2 — v1.0 (Weeks 5-8)
- YOLOv8 integration (Flask + Celery)
- Real video/image detection pipeline
- Heatmap generation
- Government admin dashboard
- Jurisdiction routing
- Push notifications (FCM)

### Phase 3 — v2.0 (Weeks 9-12)
- Social media scraping worker
- Advanced analytics (trends, severity charts)
- Mobile apps (Expo managed workflow)
- Offline mode
- Repair verification workflow
- SLA escalation automation

---

## 8. Data Model Summary

### Core Collections
```
users/          → { uid, role, phone, name, jurisdiction_id, created_at }
potholes/       → { id, lat, lng, severity, confidence, status, created_at }
detections/     → { id, media_url, pothole_ids[], confidence, processed_at }
complaints/    → { id, pothole_id, user_id, status, assigned_to, sla_deadline }
jurisdictions/  → { id, name, bounds, department_id, parent_id }
audit_logs/     → { id, user_id, action, resource, timestamp, ip }
```

### Key Indexes
- `potholes`: `status + created_at`, `jurisdiction_id + status`
- `detections`: `processed_at`, `confidence`
- `complaints`: `status + assigned_to`, `sla_deadline`

---

## 9. Deployment Architecture

```
[Users] → [Vercel CDN] → [Next.js App]
                            ↓
                    [Firebase Auth]
                    [Firestore]
                    [Firebase Storage]
                            ↓
                    [Cloud Functions] → [Flask API] → [Celery Workers]
                                                          ↓
                                                   [YOLOv8 GPU Cluster]
                                                          ↓
                                                   [Redis Queue]
```

---

## 10. Compliance & Privacy

| Requirement | Implementation |
|------------|----------------|
| Data retention | Media auto-deleted after 90 days |
| Location privacy | Exact location fuzzed for <70% zoom |
| Audit trail | All admin actions logged |
| Spam prevention | Rate limiting: 5 reports/user/day |
| Fake detection | 3-reporter threshold for auto-complaint |
| Encryption | TLS 1.3 + AES-256 at rest |

---

## 11. Performance Targets

| Metric | Target |
|--------|--------|
| Detection latency | <2s/frame |
| Dashboard load | <3s |
| Map render | <2s |
| Time to interactive | <5s on 4G |
| Lighthouse score | >90 |
| PWA offline | Core features functional |

---

## 12. Project Folder Structure

```
sadak-saathi/
├── frontend/              # Next.js web app (Expo-ready)
│   ├── app/               # App Router pages
│   ├── components/        # shadcn/ui components
│   ├── lib/               # Firebase, API clients
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand stores
│   └── types/             # TypeScript types
├── backend/               # Flask API
│   ├── app/
│   ├── services/
│   ├── workers/
│   └── requirements.txt
├── mobile/                # Expo managed workflow
│   ├── app/               # Expo Router screens
│   └── components/
├── shared/                # Shared schemas, utils
│   ├── types/
│   └── validation/
├── ai-services/           # ML pipeline
│   ├── models/
│   ├── inference/
│   └── training/
├── infra/                 # Docker, Terraform
└── docs/                  # Specifications
```

---

## 13. Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| YOLOv8 accuracy <80% | Medium | High | Retraining pipeline, human fallback |
| Firebase cold starts | High | Medium | Warm instances, CDN caching |
| Spam reports flood | High | Medium | 3-reporter threshold, rate limits |
| Mobile offline fails | Medium | Medium | IndexedDB fallback, sync queue |
| SLA misses | Medium | Low | Automated escalation alerts |

---

*Document Version: 1.0 | Last Updated: 2026-05-09*
