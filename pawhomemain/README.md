# 🐾 PawHome — Your Pet's Second Home
### Engineered by **Team Dorado**

[![Platform](https://img.shields.io/badge/Platform-Full--Stack%20Pet%20Care-008F8C.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](#)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](#)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Teal%20Theme-38bdf8.svg)](#)
[![Prisma ORM](https://img.shields.io/badge/Prisma-SQLite%20%7C%20PostgreSQL-2D3748.svg)](#)
[![License](https://img.shields.io/badge/Team-Team%20Dorado-008F8C.svg)](#)

---

## 📖 1. Project Overview

**PawHome** is a full-stack, responsive pet care management platform designed to make pet parenting easier, smarter, and more compassionate. From tracking multi-pet medical journals to analyzing canine and feline expressions using the AI Pet Mood Scanner, ordering scientifically matched nutritional meals, and securing real-time appointments with licensed veterinary surgeons and luxury grooming spas — PawHome unifies pet wellness in one seamless digital home.

### 🎨 Design System & Color Palette
- **Primary Teal:** `#008F8C`
- **Secondary Light Teal:** `#D9F3EF`
- **Background:** `#F7FAF9`
- **White:** `#FFFFFF`
- **Dark Text:** `#243333`
- **Accent Soft Green:** `#10B981`
- **Warning Soft Orange:** `#F97316`

---

## 🚀 2. Core Features

### 🐾 A. Multi-Pet Profile Management
- Register and manage profiles for dogs, cats, and companion pets.
- Store photos, breed, age, gender, date of birth, weight, allergies, core vaccination details, and behavioral traits.
- Cascade-safe deletion and live profile editing with real-time updates.

### 📸 B. AI-Powered Pet Mood Scanner (Highlight Feature)
- **Dual Capture Methods:**
  - Live Webcam Preview & Shutter capture with retake confirmation via HTML5 Canvas.
  - Image file upload (JPEG, PNG, WEBP) with automatic preview.
- **Mood Categories:** Happy, Relaxed, Curious, Playful, Fearful, Stressed.
- **Indicative Diagnostics:** Returns predicted mood badge, confidence score (%), physical posture observations, and veterinary care guidance.
- **Extensible AI Architecture:** Supports external AI Vision models via environment variables (`MOOD_AI_API_KEY`) and features an indicative demo heuristic engine when running standalone.
- **Ethical Veterinary Disclaimer:** Prominently explains that facial cues are indicative observations and do not replace holistic behavioral or veterinary diagnoses.
- **History Archive:** Scans are automatically saved to each pet's profile history.

### 🍲 C. Smart Pet Food & Nutrition Engine
- Filter by Animal (`Dog`, `Cat`, `Both`), Life Stage (`Puppy`, `Kitten`, `Adult`, `Senior`), and Category (`Dry Food`, `Wet Food`, `Special Dietary Food`).
- One-click profile matching: Automatically applies dietary filters based on the selected registered pet's species, age, and allergen warnings.
- Real-time product cards with ingredients, guaranteed nutritional breakdown, and portion guidance.
- Favorite food toggle with persistence in database.
- Explicit veterinary consultation disclaimer for pets with medical conditions.

### 🩺 D. Veterinary Appointment Booking
- Licensed doctor directory with clinic addresses, consultation fees, experience years, specializations, and ratings.
- Real-time slot availability check (`GET /api/vets/:id/slots?date=YYYY-MM-DD`).
- **Conflict Prevention:** Backend database validation strictly prevents duplicate slot reservations for the same provider.
- Automatic generation of appointment reference IDs (`PAW-VET-XXXXX`).

### ✂️ E. Pet Grooming & Spa Booking
- Salon directory with available services (Bathing, Hair Cutting, Nail Trimming, Ear Cleaning, Full Grooming, Aromatherapy Spa Treatment).
- Transparent pricing and service duration calculations.
- Live slot checking and appointment creation (`PAW-SAL-XXXXX`).

### 📅 F. Centralized Appointment Management
- Filter appointments by tab: `All`, `Upcoming`, `Completed`, `Cancelled`.
- View appointment details modal with reason, notes, and clinic location.
- One-click cancellation with confirmation dialog that immediately frees the reserved slot.

### 💉 G. Pet Health Journal & Scheduled Reminders
- Log core vaccinations, deworming pills, medical history entries, surgeries, and weight progress.
- Interactive reminders with due dates, categories, and quick completion checkboxes.
- Automated reminders synchronization with Dashboard stat widgets.

### 👤 H. User Security, Profile & Settings
- JWT Bearer authentication with 7-day or 30-day "Remember Me" sessions.
- Secure password hashing with `bcryptjs` (salt 10).
- Edit name, phone, avatar picture, and change password securely.
- Role and user boundary isolation: Strict ownership checks prevent cross-user data leakage.

---

## 🛠️ 3. Technology Stack

### Frontend
- **React 18** + **Vite 6** + **TypeScript**
- **Tailwind CSS** with custom Teal `#008F8C` theme extension
- **React Router v6** (Browser routing with `ProtectedRoute` guards)
- **Lucide React** (modern SVG icons)
- **Axios** (Bearer token request/response interceptors)
- **Recharts** (Interactive monthly wellness trends visualization)

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **Prisma ORM** (v5.22) + **SQLite** (`dev.db`)
  - *Clean, straightforward migration path to PostgreSQL by modifying the datasource provider in `schema.prisma`.*
- **JWT Authentication** (`jsonwebtoken`)
- **Password Security** (`bcryptjs`)
- **Multer** (File upload handler with size limits and MIME validation)
- **Express Rate Limiting** (Brute-force protection on auth endpoints)
- **CORS** configuration

---

## 📂 4. Project Folder Structure

```
pawhomemain/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Navbar, Sidebar, Footer, Modal, Button, Loader
│   │   │   ├── dashboard/      # Dashboard cards and widgets
│   │   │   ├── pets/           # Pet modals and cards
│   │   │   ├── mood/           # Camera and scanner views
│   │   │   ├── food/           # Nutrition and food cards
│   │   │   ├── appointments/   # Appointment manager widgets
│   │   │   └── health/         # Medical records and reminders
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── layouts/            # MainLayout (with Sidebar & Navbar), AuthLayout
│   │   ├── pages/              # SplashPage, WelcomePage, LoginPage, RegisterPage,
│   │   │                       # DashboardPage, PetsPage, PetDetailPage, MoodScannerPage,
│   │   │                       # FoodPage, VeterinaryPage, SalonPage, AppointmentsPage,
│   │   │                       # HealthPage, ProfilePage, NotFoundPage
│   │   ├── services/           # api, authService, petService, moodService, foodService,
│   │   │                       # bookingService, healthService
│   │   ├── types/              # Comprehensive TypeScript interfaces
│   │   ├── App.tsx             # Route definitions & guards
│   │   ├── main.tsx            # App bootstrap
│   │   └── index.css           # Tailwind base & custom animations
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                     # Express + TypeScript + Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma       # SQLite/PostgreSQL Prisma Schema
│   │   └── seed.ts             # Rich initial database seeder
│   ├── src/
│   │   ├── config/             # database.ts, jwt.ts
│   │   ├── controllers/        # auth, pet, mood, food, vet, salon, appointment, health, reminder
│   │   ├── middleware/         # authMiddleware, uploadMiddleware, errorHandler
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # moodAnalysisService (AI & Demo Heuristics)
│   │   ├── utils/              # testSuite.ts (E2E Verification script)
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server entry point
│   ├── tsconfig.json
│   └── package.json
├── uploads/                    # Uploaded pet photos and camera captures
├── .env.example                # Example environment configuration
├── .gitignore
├── package.json                # Root automation scripts
└── README.md                   # This documentation
```

---

## ⚙️ 5. Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm**: v9.0.0 or higher

### Step 1: Clone or Open the Workspace
```bash
cd pawhomemain
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../client
npm install
cd ..
```

---

## 🗄️ 6. Database Migration & Seeding

PawHome is pre-configured with SQLite for zero-friction local setup, with clean models ready for PostgreSQL deployment.

```bash
cd server

# Generate Prisma Client
npx prisma generate

# Synchronize database schema with dev.db
npx prisma db push

# Seed database with sample veterinarians, salons, services, food catalogue, and demo user
npm run seed
```

### Pre-configured Demo Account:
- **Email:** `demo@pawhome.com`
- **Password:** `Password123!`
- *(Or click the 1-click **"Use Demo Account"** button on the Login page)*

---

## 🏃 7. Running the Application

### Option A: Running with Two Terminals

#### Terminal 1 (Backend Server — Port 5000):
```bash
cd server
npm run dev
```
*Server starts at `http://localhost:5000` with API health check at `http://localhost:5000/api/health-check`.*

#### Terminal 2 (Frontend Client — Port 5173):
```bash
cd client
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🧪 8. Automated End-to-End Testing

PawHome includes an automated E2E test suite that runs 24 comprehensive checks across authentication, multiple pets, AI mood analysis, food filtering, slot locking, duplicate booking prevention, and cross-user data security.

To execute the test suite:
```bash
cd server
npx tsx src/utils/testSuite.ts
```

Output:
```
==============================================
🎉 ALL 24/24 TESTS PASSED SUCCESSFULLY!
🐾 PawHome platform by Team Dorado is fully verified.
==============================================
```

---

## 📡 9. REST API Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new pet parent | No |
| `POST` | `/api/auth/login` | Login and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & counts | Yes (Bearer) |
| `PUT` | `/api/auth/profile` | Update profile information | Yes (Bearer) |
| `PUT` | `/api/auth/change-password` | Change password with bcrypt verification | Yes (Bearer) |

### Pets
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/pets` | Get all pets for current user | Yes (Bearer) |
| `POST` | `/api/pets` | Add a new pet profile | Yes (Bearer) |
| `GET` | `/api/pets/:id` | Get pet by ID with health & mood logs | Yes (Bearer) |
| `PUT` | `/api/pets/:id` | Update pet details | Yes (Bearer) |
| `DELETE` | `/api/pets/:id` | Delete pet profile (cascade) | Yes (Bearer) |

### AI Mood Scanner
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/mood/analyze` | Analyze photo (file or base64) & save scan | Yes (Bearer) |
| `GET` | `/api/mood/history/:petId` | Retrieve past mood scans for pet | Yes (Bearer) |

### Pet Food
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/food` | Filter food catalogue by animal, age, type | Optional |
| `GET` | `/api/food/:id` | Get specific product details | No |
| `GET` | `/api/food/favorites` | Get user saved favorite foods | Yes (Bearer) |
| `POST` | `/api/food/favorites` | Toggle food favorite status | Yes (Bearer) |

### Veterinary & Salons
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/vets` | List all doctors with fees & availability | No |
| `GET` | `/api/vets/:id` | Doctor profile | No |
| `GET` | `/api/vets/:id/slots` | Real-time available slots for date | No |
| `GET` | `/api/salons` | List grooming studios and services | No |
| `GET` | `/api/salons/:id` | Salon profile | No |
| `GET` | `/api/salons/:id/slots` | Real-time salon available slots for date | No |

### Appointments
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/appointments` | Book appointment (prevents slot collision) | Yes (Bearer) |
| `GET` | `/api/appointments` | List user appointments with provider details | Yes (Bearer) |
| `GET` | `/api/appointments/:id` | Get appointment details | Yes (Bearer) |
| `PUT` | `/api/appointments/:id/cancel` | Cancel appointment & release slot | Yes (Bearer) |

### Health & Reminders
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health/:petId` | Get medical journal for pet | Yes (Bearer) |
| `POST` | `/api/health` | Add vaccine / deworming / medical record | Yes (Bearer) |
| `PUT` | `/api/health/:id` | Update health record | Yes (Bearer) |
| `DELETE` | `/api/health/:id` | Delete health record | Yes (Bearer) |
| `GET` | `/api/reminders` | Get active reminders for user's pets | Yes (Bearer) |
| `POST` | `/api/reminders` | Create new reminder | Yes (Bearer) |
| `PUT` | `/api/reminders/:id` | Update / toggle reminder completed status | Yes (Bearer) |
| `DELETE` | `/api/reminders/:id` | Delete reminder | Yes (Bearer) |

---

## 🔒 10. Security & Privacy
1. **Password Encryption**: All passwords securely hashed with `bcryptjs` using a salt work factor of 10.
2. **Access Control**: Every endpoint verifies resource ownership against `req.user.id` so users can never view, update, or delete other users' records.
3. **Upload Sanitization**: Uploaded files validated for safe image MIME types (`image/jpeg`, `image/png`, `image/webp`) with a 10MB limit.
4. **Rate Limiting**: Authentication endpoints are rate-limited to mitigate credential stuffing.

---

## 🏆 Crafted with Pride by Team Dorado
**PawHome — Your Pet's Second Home**
Built to elevate pet care through technology, empathy, and design.
