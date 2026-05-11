# Sadak Saathi — Autonomous Pothole Intelligence Platform

> AI-powered road infrastructure monitoring platform that transforms citizen reports, vehicle cameras, and CCTV feeds into actionable intelligence for government road maintenance departments.

## Project Overview

Sadak Saathi ("Road Companion") is a comprehensive full-stack platform built with:

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, TypeScript, TailwindCSS, shadcn/ui |
| **Maps** | Leaflet 1.9, Recharts |
| **Backend** | Flask 3, Python 3.11, Celery + Redis |
| **AI/ML** | YOLOv8, PyTorch, OpenCV |
| **Database** | Firebase (Firestore + Storage) |
| **Auth** | Firebase Auth (OTP, Email, Google) |
| **DevOps** | Docker, GitHub Actions |

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Firebase project with Firestore + Storage enabled

### Setup

```bash
# Clone and install frontend deps
cd frontend && npm install

# Install backend deps
cd ../backend && pip install -r requirements.txt

# Copy environment files
cp backend/.env.example backend/.env
cp .env.example .env.local

# Edit backend/.env with your Firebase credentials

# Start services
docker-compose up -d redis
```

### Development

```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && flask run --reload
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SADAK SAATHI ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│   │Citizen  │  │Inspector│  │Officer  │  │Admin    │        │
│   │  App    │  │  App    │  │Portal   │  │Portal   │        │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│        │            │            │            │               │
│        └────────────┴────────────┴────────────┘               │
│                         │                                     │
│                  ┌──────▼──────┐                              │
│                  │  Next.js   │                              │
│                  │  Frontend  │                              │
│                  │  (Vercel)  │                              │
│                  └──────┬─────┘                              │
│                         │                                     │
│        ┌────────────────┼────────────────┐                  │
│        │                │                │                   │
│   ┌────▼────┐     ┌─────▼────┐    ┌─────▼────┐             │
│   │Firebase │     │Flask API │    │Firebase  │             │
│   │  Auth   │     │ (Render) │    │Functions │             │
│   │ +Store  │     └─────┬────┘    └─────┬────┘             │
│   └─────────┘           │               │                   │
│                         └───────┬───────┘                   │
│                    ┌────────────▼────────────┐               │
│                    │   Celery + Redis        │               │
│                    │   (Background Workers)  │               │
│                    └────────────┬────────────┘               │
│                         ┌──────▼──────┐                      │
│                         │  YOLOv8 ML  │                      │
│                         │   Service   │                      │
│                         └─────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
sadak-saathi/
├── frontend/                    # Next.js web app
│   ├── app/                     # App Router pages
│   │   ├── (main)/             # Main layout pages
│   │   │   ├── dashboard/      # Dashboard
│   │   │   ├── map/            # Map view
│   │   │   ├── report/         # Report pothole
│   │   │   ├── complaints/    # Complaints tracking
│   │   │   └── analytics/     # Analytics dashboard
│   │   └── auth/               # Auth pages
│   ├── components/             # UI components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utilities
│   │   ├── firebase.ts         # Firebase init
│   │   ├── firestore.ts        # Firestore service
│   │   └── utils.ts            # Helpers
│   ├── stores/                 # Zustand stores
│   │   ├── auth.ts             # Auth state
│   │   └── map.ts              # Map state
│   └── types/                  # TypeScript types
│
├── backend/                     # Flask API
│   ├── app/
│   │   ├── api/               # API blueprints
│   │   │   ├── auth.py        # Auth endpoints
│   │   │   ├── upload.py      # Media upload
│   │   │   ├── detection.py   # Detection API
│   │   │   ├── potholes.py    # Pothole CRUD
│   │   │   ├── complaints.py  # Complaints workflow
│   │   │   ├── analytics.py   # Analytics data
│   │   │   └── admin.py       # Admin endpoints
│   │   ├── services/          # Business logic
│   │   │   └── detection.py   # YOLOv8 service
│   │   └── workers/           # Celery tasks
│   ├── requirements.txt
│   └── Dockerfile
│
├── shared/                      # Shared code
│   ├── types/                  # TypeScript types
│   └── validation/             # Zod schemas
│
├── ai-services/                # ML pipeline
│   ├── models/                 # YOLOv8 models
│   └── inference/             # Inference scripts
│
├── infra/                      # Infrastructure
│   └── docker-compose.yml
│
├── docs/                       # Documentation
├── SPEC.md                     # Project specification
└── README.md
```

## Features

### Citizen Features
- [ ] OTP-based login
- [ ] Camera capture for pothole reporting
- [ ] Live location detection
- [ ] AI-powered pothole detection (auto-severity)
- [ ] Complaint tracking with timeline
- [ ] Push notifications
- [ ] Multi-language support (EN, HI, TA, MR)

### Government Officer Features
- [ ] Interactive map with heatmaps
- [ ] Pothole verification workflow
- [ ] Jurisdiction-based filtering
- [ ] Complaint assignment
- [ ] Analytics dashboard
- [ ] SLA tracking with alerts

### Admin Features
- [ ] User management
- [ ] AI moderation queue
- [ ] Audit logs
- [ ] Jurisdiction management
- [ ] System health monitoring

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/send-otp` | Send OTP to phone |
| POST | `/api/v1/auth/verify-otp` | Verify OTP & get token |
| POST | `/api/v1/auth/google` | Google login |
| GET | `/api/v1/auth/me` | Get current user |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/upload/image` | Upload image |
| POST | `/api/v1/upload/video` | Upload video |

### Detections
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/detections` | Create detection task |
| GET | `/api/v1/detections` | List detections |
| GET | `/api/v1/detections/:id` | Get detection |

### Potholes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/potholes` | List potholes |
| GET | `/api/v1/potholes/nearby` | Nearby potholes |
| PATCH | `/api/v1/potholes/:id` | Update pothole |

### Complaints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/complaints` | Create complaint |
| GET | `/api/v1/complaints` | List complaints |
| PATCH | `/api/v1/complaints/:id` | Update status |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/summary` | Dashboard summary |
| GET | `/api/v1/analytics/trends` | Trends over time |
| GET | `/api/v1/analytics/severity` | Severity distribution |

## Deployment

### Frontend (Vercel)
```bash
cd frontend && vercel
```

### Backend (Render/GCP)
```bash
# Create Render service
curl -X POST "https://api.render.com/v1/blueprints" \
  -H "Authorization: Bearer $RENDER_API_KEY"
```

### Docker
```bash
docker-compose up -d
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Backend (.env)
```
FIREBASE_CREDENTIALS_PATH=./config/firebase-credentials.json
CELERY_BROKER_URL=redis://localhost:6379/0
YOLO_MODEL_PATH=models/yolov8n-pothole.pt
YOLO_CONFIDENCE_THRESHOLD=0.7
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Detection latency | <2s/frame |
| Dashboard load | <3s |
| Map render | <2s |
| Time to interactive | <5s on 4G |
| Lighthouse score | >90 |

## Future Roadmap

### Phase 2 (v1.0)
- [ ] Real YOLOv8 model training
- [ ] Social media scraping
- [ ] Drone footage integration
- [ ] CCTV stream processing

### Phase 3 (v2.0)
- [ ] Expo mobile apps (Android/iOS)
- [ ] Offline-first with sync
- [ ] Advanced repair verification
- [ ] Budget optimization AI

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See LICENSE file

---

Built with care for better roads and safer commutes.
