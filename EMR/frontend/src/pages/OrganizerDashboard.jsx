
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import API from '../services/api'

function OrganizerDashboard() {
  const [events, setEvents] = useState([])
  const [statistics, setStatistics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(null)

  const navigate = useNavigate()

  const fetchDashboardData = async () => {
    try {
      setError('')

      const [eventsResponse, statsResponse] = await Promise.all([
        API.get('events/my-events/'),
        API.get('events/dashboard/statistics/')
      ])

      setEvents(eventsResponse.data)
      setStatistics(statsResponse.data)

    } catch (err) {
      console.error(err)
      setError('Unable to load organizer dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleCancelEvent = async (eventId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this event?'
    )

    if (!confirmed) return

    setCancelling(eventId)
    setError('')

    try {
      await API.patch(`events/${eventId}/cancel/`)

      alert('Event cancelled successfully!')

      await fetchDashboardData()

    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Unable to cancel event.'
      )
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div>
      <Navbar />

      <main>
        <h1>Organizer Dashboard</h1>

        <p>Manage your events and track registrations.</p>

        <button
          onClick={() => navigate('/create-event')}
        >
          Create New Event
        </button>

        {loading && <p>Loading dashboard...</p>}

        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}

        {!loading && !error && (
          <div>
            {/* My Events */}

            <h2>My Events</h2>

            <p>Total Events: {events.length}</p>

            {events.length === 0 ? (
              <p>You haven't created any events yet.</p>
            ) : (
              events.map((event) => (
                <div key={event.id}>
                  <h3>{event.title}</h3>

                  <p>{event.short_description}</p>

                  <p>Category: {event.category}</p>

                  <p>Venue: {event.venue}</p>

                  <p>
                    Start Date:{' '}
                    {new Date(event.start_date).toLocaleString()}
                  </p>

                  <p>Status: {event.status}</p>

                  <div>
                    <button
                      onClick={() =>
                        navigate(`/edit-event/${event.id}`)
                      }
                      disabled={event.status === 'cancelled'}
                    >
                      Edit Event
                    </button>

                    {event.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelEvent(event.id)}
                        disabled={cancelling === event.id}
                      >
                        {cancelling === event.id
                          ? 'Cancelling...'
                          : 'Cancel Event'}
                      </button>
                    )}
                    <button
                        onClick={() =>
                          navigate(`/organizer/events/${event.id}/participants`)
                        }
                      >
                        View Participants
                      </button>
                  </div>

                  <hr />
                </div>
              ))
            )}

            {/* Registration Statistics */}

            <h2>Registration Statistics</h2>

            {statistics.length === 0 ? (
              <p>No registration statistics available.</p>
            ) : (
              statistics.map((stat) => (
                <div key={stat.event_id}>
                  <h3>{stat.title}</h3>

                  <div>
                    <h4>Total Registrations</h4>
                    <p>{stat.total_registrations}</p>
                  </div>

                  <div>
                    <h4>Confirmed Participants</h4>
                    <p>{stat.active_registrations}</p>
                  </div>

                  <div>
                    <h4>Waitlisted Participants</h4>
                    <p>{stat.waitlisted_registrations}</p>
                  </div>

                  <div>
                    <h4>Cancelled Registrations</h4>
                    <p>{stat.cancelled_registrations}</p>
                  </div>

                  <div>
                    <h4>Available Seats</h4>
                    <p>{stat.available_seats}</p>
                  </div>

                  <div>
                    <h4>Event Capacity</h4>
                    <p>{stat.capacity}</p>
                  </div>

                  <hr />
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default OrganizerDashboard
