# Shri Shahu Prabodhini — Sankalp Online Exam Website

A React (Vite) website for Shri Shahu Prabodhini school, built around the **Sankalp Online
Scholarship Exam** with 3 role-based logins (Admin / Coordinator / Student), a student
registration flow with **Razorpay** payment integration, and all the pages/menus requested.

## 1. Run it locally

```bash
npm install
npm run dev
```
Then open the printed local URL (usually http://localhost:5173).

To build for hosting:
```bash
npm run build       # outputs to /dist — upload this folder to any static host
```

## 2. Production configuration

The production client points to `https://shrishahuprabodhini.in/api` and uses the live
Razorpay Key ID from `.env.production`. The client calls these backend endpoints during
registration:

- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/students`

Configure the matching Razorpay **Key ID** and **Key Secret** in the backend deployment.
The Key Secret must never be added to a `VITE_` variable, committed to this repository, or
sent to the browser. The backend must verify the Razorpay signature before allowing the
student record to be saved.

## 3. Where things live

| What | File |
|---|---|
| All text/content (slider, courses, toppers, gallery, faculty, testimonials, exam info, syllabus) | `src/data/siteData.js` |
| Centers (Form 1) + Districts/Talukas | `src/data/centersData.js` |
| Coordinators (Form 3), linked to a Center | `src/data/coordinatorsData.js` |
| Students (Form 4 registrations) | `src/data/studentsData.js` |
| Dummy login logic (3 roles) | `src/context/AuthContext.jsx` |
| Razorpay helper | `src/utils/razorpay.js` |
| Navbar menu structure | `src/components/Navbar.jsx` |
| All routes | `src/App.jsx` |

Everything is **dummy data in plain JS files** — swap these for real API calls later without
touching the UI components.

## 4. Demo login credentials

| Role | ID | Password |
|---|---|---|
| Admin | `admin` | `admin@123` |
| Coordinator | `coordinator1` | `coord@123` |
| Student | `SSP2026-0001` | `ssp0001` |

New students get a fresh Roll No. + password automatically at the end of registration.

## 5. How Center ↔ Coordinator ↔ Student are linked

- Each **Center** (Form 1) belongs to a District + Taluka.
- Each **Coordinator** (Form 3) is allocated to exactly one Center.
- On the **Student Registration Form**, the student picks District → Taluka → Exam Center,
  and the Co-ordinator dropdown automatically filters to only the coordinators allocated to
  that center. Admin can add more Centers/Coordinators from the Admin Dashboard → Settings.

## 6. Pages included

Home (10-module layout), Sankalp Online Exam (Exam Information, Syllabus, Answer Key, Result
Check, Results PDF), Courses, Awards, Toppers, Gallery, Faculties, Testimonials, About Us,
Vision & Mission (Director's Message), Contact Us, Download, Privacy Policy, Refund Policy,
Login (3 roles), Student Registration, and Admin/Coordinator/Student dashboards.

## 7. Notes for the developer taking this further

- Icons: `lucide-react`. Routing: `react-router-dom`. Styling: Tailwind CSS.
- Replace Unsplash placeholder images in `src/data/siteData.js` with real school photos.
- Replace the Google Maps embed URL in `siteData.js` (`mapEmbed`) with your actual school's
  embed link from Google Maps → Share → Embed a map.
- For production, move all "dummy data" writes (Admin adding a Center/Coordinator, Student
  registering) to real backend API calls + a database.
