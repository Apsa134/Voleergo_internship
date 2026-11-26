
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Events from './pages/Events'
import ProtectedRoute from './components/ProtectedRoute'
import EventDetails from './pages/EventDetails'
import MyRegistrations from './pages/MyRegistrations'
import Profile from './pages/Profile'
import OrganizerApplication from './pages/OrganizerApplication'
import OrganizerDashboard from './pages/OrganizerDashboard'
import CreateEvent from './pages/createEvent'
import EditEvent from './pages/EditEvent'
import EventParticipants from './pages/EventParticipants'
import AdminDashboard from './pages/AdminDashboard'


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/my-registrations" element={<MyRegistrations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/organizer-application"element={<OrganizerApplication />}/>
        <Route path="/organizer-dashboard"element={<OrganizerDashboard />}/>
       <Route path="/create-event" element={<CreateEvent />} />
       <Route path="/edit-event/:eventId" element={<EditEvent />} />
       <Route path="/organizer/events/:eventId/participants"element={<EventParticipants />}/>
       <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  ) 
}

export default App
