import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import SmoothScroll from './components/SmoothScroll'
import CursorTrail from './components/CursorTrail'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import Heritage from './pages/Heritage'
import Dining from './pages/Dining'
import Accommodation from './pages/Accommodation'
import Sports from './pages/Sports'
import Membership from './pages/Membership'
import Events from './pages/Events'
import Contact from './pages/Contact'
import MemberAuth from './portal/MemberAuth'
import MemberDashboard from './portal/MemberDashboard'
import AdminLogin from './portal/AdminLogin'
import AdminPanel from './portal/AdminPanel'
import './App.css'

export default function App() {
  const location = useLocation()

  // The portal / admin dashboards render on their own — no marketing chrome,
  // no smooth-scroll, no cursor trail.
  const isPortal = ['/login', '/members', '/admin'].some((p) => location.pathname.startsWith(p))

  if (isPortal) {
    return (
      <Routes location={location}>
        <Route path="/login" element={<MemberAuth />} />
        <Route path="/members" element={<MemberDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    )
  }

  return (
    <SmoothScroll>
      <CursorTrail />
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/heritage" element={<PageTransition><Heritage /></PageTransition>} />
          <Route path="/dining" element={<PageTransition><Dining /></PageTransition>} />
          <Route path="/accommodation" element={<PageTransition><Accommodation /></PageTransition>} />
          <Route path="/sports" element={<PageTransition><Sports /></PageTransition>} />
          <Route path="/membership" element={<PageTransition><Membership /></PageTransition>} />
          <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </SmoothScroll>
  )
}
