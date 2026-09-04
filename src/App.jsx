import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import Features from "./pages/Features.jsx";
import Awards from "./pages/Awards.jsx";
import Toppers from "./pages/Toppers.jsx";
import Gallery from "./pages/Gallery.jsx";
import Faculties from "./pages/Faculties.jsx";
import Testimonials from "./pages/Testimonials.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import VisionMission from "./pages/VisionMission.jsx";
import Download from "./pages/Download.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import RefundPolicy from "./pages/RefundPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import StudentRegistration from "./pages/StudentRegistration.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

import ExamInformation from "./pages/sankalp/ExamInformation.jsx";
import Syllabus from "./pages/sankalp/Syllabus.jsx";
import AnswerKey from "./pages/sankalp/AnswerKey.jsx";
import ResultCheck from "./pages/sankalp/ResultCheck.jsx";
import ResultsPDF from "./pages/sankalp/ResultsPDF.jsx";
import TestSeries from "./pages/sankalp/TestSeries.jsx";
import Ebook from "./pages/sankalp/ebook/Ebook.jsx";
import TestSeriesDetail from "./pages/sankalp/TestSeriesDetail.jsx";
import StartExam from "./pages/sankalp/StartExam.jsx";
import ExamPlayer from "./pages/sankalp/ExamPlayer.jsx";

import AdminDashboard from "./pages/dashboards/AdminDashboard.jsx";
import CoordinatorDashboard from "./pages/dashboards/CoordinatorDashboard.jsx";
import StudentDashboard from "./pages/dashboards/StudentDashboard.jsx";
import Notification from "./components/Notification.jsx";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />

            <Route path="/sankalp/exam-information" element={<ExamInformation />} />
            <Route path="/sankalp/syllabus" element={<Syllabus />} />
            <Route path="/sankalp/answer-key" element={<AnswerKey />} />
            <Route path="/sankalp/result-check" element={<ResultCheck />} />
            <Route path="/sankalp/results-pdf" element={<ResultsPDF />} />
            <Route path="/sankalp/test-series" element={<TestSeries />} />
            <Route path="/sankalp/ebook" element={<Ebook />} />
            <Route path="/sankalp/test-series/:id" element={<TestSeriesDetail />} />
            <Route path="/exam/:id/start" element={<StartExam />} />
            <Route path="/exam/:id" element={<ExamPlayer />} />

            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/features" element={<Features />} />
            <Route path="/awards" element={<Awards />} />
            <Route path="/toppers" element={<Toppers />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/faculties" element={<Faculties />} />
            <Route path="/testimonials" element={<Testimonials />} />

            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/vision-mission" element={<VisionMission />} />
            <Route path="/download" element={<Download />} />
            <Route path="/notifications" element={<Notification />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

            <Route path="/register" element={<StudentRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/coordinator/dashboard"
              element={<ProtectedRoute role="coordinator"><CoordinatorDashboard /></ProtectedRoute>}
            />
            <Route path="/student" element={<Navigate to="/student/profile" replace />} />
            <Route
              path="/student/dashboard"
              element={<ProtectedRoute role="student"><StudentDashboard defaultTab="profile" /></ProtectedRoute>}
            />
            <Route
              path="/student/profile"
              element={<ProtectedRoute role="student"><StudentDashboard defaultTab="profile" /></ProtectedRoute>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
