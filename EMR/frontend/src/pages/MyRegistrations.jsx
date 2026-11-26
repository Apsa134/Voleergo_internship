
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import API from '../services/api'

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  const [message, setMessage] = useState('')

  const fetchRegistrations = async () => {
    try {
      const response = await API.get('events/my-registrations/')
      setRegistrations(response.data)
    } catch (err) {
      setError('Unable to load your registrations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const handleCancel = async (registrationId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this registration?'
    )

    if (!confirmed) return

    setCancellingId(registrationId)
    setMessage('')
    setError('')

    try {
      await API.patch(
        `events/registrations/${registrationId}/cancel/`
      )

      setMessage('Registration cancelled successfully.')

      await fetchRegistrations()
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Unable to cancel registration. Please try again.'
      )
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div>
      <Navbar />

      <main>
        <h1>My Registrations</h1>
        <p>View and manage the events you have joined.</p>

        {loading && <p>Loading your registrations...</p>}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {message && <p style={{ color: 'green' }}>{message}</p>}

        {!loading && registrations.length === 0 && (
          <p>You haven't registered for any events yet.</p>
        )}

        {!loading && registrations.map((registration) => (
          <div key={registration.id}>
            <h2>{registration.event_details.title}</h2>

            <p>
              Venue: {registration.event_details.venue}
            </p>

            <p>
              Start Date:{' '}
              {new Date(
                registration.event_details.start_date
              ).toLocaleString()}
            </p>

            <p>
              Registration Status: {registration.status}
            </p>

            <p>
              Registered on:{' '}
              {new Date(registration.registered_at).toLocaleString()}
            </p>

            <Link to={`/events/${registration.event}`}>
              View Event
            </Link>

            {registration.status !== 'cancelled' && (
              <button
                onClick={() => handleCancel(registration.id)}
                disabled={cancellingId === registration.id}
              >
                {cancellingId === registration.id
                  ? 'Cancelling...'
                  : 'Cancel Registration'}
              </button>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}

export default MyRegistrations
