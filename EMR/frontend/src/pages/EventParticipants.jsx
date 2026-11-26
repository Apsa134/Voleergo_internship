
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import API from '../services/api'

function EventParticipants() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [participants, setParticipants] = useState([])
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const [participantsResponse, eventResponse] = await Promise.all([
          API.get(`events/${eventId}/participants/`),
          API.get(`events/${eventId}/`)
        ])

        setParticipants(participantsResponse.data)
        setEvent(eventResponse.data)

      } catch (err) {
        console.error(err)
        setError(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          'Unable to load event participants.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchParticipants()
  }, [eventId])

  const confirmed = participants.filter(
    (p) => p.status === 'registered'
  )

  const waitlisted = participants.filter(
    (p) => p.status === 'waitlisted'
  )

  const cancelled = participants.filter(
    (p) => p.status === 'cancelled'
  )

  const renderParticipants = (list) => {
    if (list.length === 0) {
      return <p>No participants in this category.</p>
    }

    return (
      <div>
        {list.map((participant) => (
          <div key={participant.registration_id}>
            <h4>{participant.username}</h4>

            <p>Email: {participant.email}</p>

            <p>
              Registered At:{' '}
              {new Date(participant.registered_at).toLocaleString()}
            </p>

            <p>Status: {participant.status}</p>

            <hr />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <Navbar />

      <main>
        <button onClick={() => navigate('/organizer-dashboard')}>
          Back to Dashboard
        </button>

        {loading && <p>Loading participants...</p>}

        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}

        {!loading && !error && (
          <div>
            <h1>Event Participants</h1>

            {event && (
              <>
                <h2>{event.title}</h2>
                <p>Venue: {event.venue}</p>
                <p>Capacity: {event.capacity}</p>
              </>
            )}

            <hr />

            <h2>Registration Summary</h2>

            <p>Total Registrations: {participants.length}</p>
            <p>Confirmed: {confirmed.length}</p>
            <p>Waitlisted: {waitlisted.length}</p>
            <p>Cancelled: {cancelled.length}</p>

            <hr />

            <h2>Confirmed Participants</h2>
            {renderParticipants(confirmed)}

            <hr />

            <h2>Waitlisted Participants</h2>
            {renderParticipants(waitlisted)}

            <hr />

            <h2>Cancelled Registrations</h2>
            {renderParticipants(cancelled)}
          </div>
        )}
      </main>
    </div>
  )
}

export default EventParticipants
