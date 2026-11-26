
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import API from '../services/api'

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedVenue, setSelectedVenue] = useState('')

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

  // Get unique categories and venues
  const categories = [
    ...new Set(events.map((event) => event.category).filter(Boolean))
  ]

  const venues = [
    ...new Set(events.map((event) => event.venue).filter(Boolean))
  ]

  // Search and filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesCategory =
      !selectedCategory || event.category === selectedCategory

    const matchesVenue =
      !selectedVenue || event.venue === selectedVenue

    return matchesSearch && matchesCategory && matchesVenue
  })

  return (
    <div>
      <Navbar />

      <main>
        <h1>Explore Events</h1>
        <p>Discover upcoming events and find something interesting to participate in.</p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search events by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Venue Filter */}
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
        >
          <option value="">All Venues</option>

          {venues.map((venue) => (
            <option key={venue} value={venue}>
              {venue}
            </option>
          ))}
        </select>

        {loading && <p>Loading events...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <section>
            <h2>Available Events ({filteredEvents.length})</h2>

            {filteredEvents.length === 0 ? (
              <p>No events found matching your search.</p>
            ) : (
              filteredEvents.map((event) => (
                <div key={event.id}>
                  <h3>{event.title}</h3>

                  <p>{event.short_description}</p>

                  <p>Category: {event.category}</p>

                  <p>Venue: {event.venue}</p>

                  <p>
                    Date: {new Date(event.start_date).toLocaleDateString()}
                  </p>

                  <Link to={`/events/${event.id}`}>
                    View Details
                  </Link>
                </div>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default Events
