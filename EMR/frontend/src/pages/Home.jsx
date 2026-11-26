
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import API from '../services/api'
import { Link } from 'react-router-dom'


function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await API.get('events/list/')
        setEvents(response.data)
      } catch (err) {
        setError('Unable to load events. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div>
      <Navbar />

      <main>
        <h1>Welcome to EMR</h1>
        <p>Discover and participate in exciting events.</p>

        <section>
          <h2>Upcoming Events</h2>

          {loading && <p>Loading events...</p>}

          {error && <p>{error}</p>}

          {!loading && !error && events.length === 0 && (
            <p>No upcoming events available right now.</p>
          )}

          <div>
            {events.map((event) => (
              <div key={event.id}>
                <h3>{event.title}</h3>
                <p>{event.short_description}</p>
                <p>Venue: {event.venue}</p>
                <p>
                  Date: {new Date(event.start_date).toLocaleDateString()}
                </p>
				<Link to={`/events/${event.id}`}>
					View Details
				</Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
