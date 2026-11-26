
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import API from '../services/api'

function AdminDashboard() {
  const [applications, setApplications] = useState([])
  const [events, setEvents] = useState([])
  const [registrations, setRegistrations] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getList = (data) => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.results)) return data.results
    return []
  }

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [
          applicationsResponse,
          eventsResponse,
          registrationsResponse
        ] = await Promise.all([
          API.get('accounts/admin/organizer-applications/'),
          API.get('events/admin/all-events/'),
          API.get('events/admin/registrations/')
        ])

        setApplications(getList(applicationsResponse.data))
        setEvents(getList(eventsResponse.data))
        setRegistrations(getList(registrationsResponse.data))

      } catch (err) {
        console.error(err)

        setError(
          err.response?.status === 403
            ? 'You do not have administrator access.'
            : 'Unable to load admin dashboard.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const pendingApplications = applications.filter(
    (app) => app.status === 'pending'
  )

  return (
    <div>
      <Navbar />

      <main>
        <h1>Admin Dashboard</h1>
        <p>Monitor and manage the Event Management Platform.</p>

        {loading && <p>Loading admin dashboard...</p>}

        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            <h2>Platform Overview</h2>

            <div>
              <h3>Total Organizer Applications</h3>
              <p>{applications.length}</p>
            </div>

            <div>
              <h3>Pending Applications</h3>
              <p>{pendingApplications.length}</p>
            </div>

            <div>
              <h3>Total Events</h3>
              <p>{events.length}</p>
            </div>

            <div>
              <h3>Total Registrations</h3>
              <p>{registrations.length}</p>
            </div>

            <hr />

            <h2>Recent Organizer Applications</h2>

            {applications.length === 0 ? (
              <p>No organizer applications found.</p>
            ) : (
              applications.map((app) => (
                <div key={app.id}>
                  <h3>{app.organization_name}</h3>
                  <p>User: {app.username || app.user}</p>
                  <p>Status: {app.status}</p>
                  <p>Reason: {app.reason}</p>
                  <hr />
                </div>
              ))
            )}

            <h2>Recent Events</h2>

            {events.length === 0 ? (
              <p>No events found.</p>
            ) : (
              events.slice(0, 5).map((event) => (
                <div key={event.id}>
                  <h3>{event.title}</h3>
                  <p>Venue: {event.venue}</p>
                  <p>Status: {event.status}</p>
                  <hr />
                </div>
              ))
            )}

            <h2>Recent Registrations</h2>

            {registrations.length === 0 ? (
              <p>No registrations found.</p>
            ) : (
              registrations.slice(0, 5).map((registration) => (
                <div key={registration.id}>
                  <p>Registration ID: {registration.id}</p>
                  <p>Status: {registration.status}</p>
                  <hr />
                </div>
              ))
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
