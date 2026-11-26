
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import API from '../services/api'

function EventDetails() {
  const { eventId } = useParams()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [existingRegistration, setExistingRegistration] = useState(null)
  const [checkingRegistration, setCheckingRegistration] = useState(true)

  const [registering, setRegistering] = useState(false)
  const [registrationMessage, setRegistrationMessage] = useState('')
  const [registrationError, setRegistrationError] = useState('')

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await API.get(`events/${eventId}/`)
        setEvent(response.data)
      } catch (err) {
        setError('Unable to load event details.')
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetails()
  }, [eventId])

  // Fetch existing registration
  const fetchMyRegistration = async () => {
    try {
      const response = await API.get('events/my-registrations/')

      const activeRegistration = response.data.find(
        (registration) =>
          registration.event === Number(eventId) &&
          ['registered', 'waitlisted'].includes(registration.status)
      )

      setExistingRegistration(activeRegistration || null)
    } catch (err) {
      console.error('Unable to fetch registrations:', err)
    } finally {
      setCheckingRegistration(false)
    }
  }

  useEffect(() => {
    setCheckingRegistration(true)
    fetchMyRegistration()
  }, [eventId])

  // Register for event
  const handleRegister = async () => {
    setRegistering(true)
    setRegistrationMessage('')
    setRegistrationError('')

    try {
      const response = await API.post(`events/${eventId}/register/`)

      setRegistrationMessage(
        response.data.message || 'Registration successful!'
      )

      // Fetch updated registration status
      await fetchMyRegistration()

    } catch (err) {
      const errorData = err.response?.data

      setRegistrationError(
        errorData?.error ||
        errorData?.detail ||
        errorData?.message ||
        'Registration failed. Please try again.'
      )

      // Refresh registration state
      await fetchMyRegistration()
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div>
      <Navbar />

      <main>
        <Link to="/home">Back to Home</Link>

        {loading && <p>Loading event details...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && event && (
          <section>
            <h1>{event.title}</h1>

            <p>{event.short_description}</p>

            <h2>About This Event</h2>
            <p>{event.description}</p>

            <h3>Event Information</h3>

            <p>Category: {event.category}</p>
            <p>Venue: {event.venue}</p>

            <p>
              Start Date: {new Date(event.start_date).toLocaleString()}
            </p>

            <p>
              End Date: {new Date(event.end_date).toLocaleString()}
            </p>

            <p>
              Registration Deadline:{' '}
              {new Date(event.registration_deadline).toLocaleString()}
            </p>

            <p>Capacity: {event.capacity}</p>

            {/* Registration status and button */}
            {checkingRegistration ? (
              <p>Checking your registration...</p>
            ) : existingRegistration ? (
              <div>
                {existingRegistration.status === 'registered' && (
                  <p>You are successfully registered for this event.</p>
                )}

                {existingRegistration.status === 'waitlisted' && (
                  <p>You are currently on the waiting list for this event.</p>
                )}
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
              >
                {registering ? 'Registering...' : 'Register for Event'}
              </button>
            )}

            {registrationMessage && (
              <p>{registrationMessage}</p>
            )}

            {registrationError && (
              <p style={{ color: 'red' }}>
                {registrationError}
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default EventDetails
