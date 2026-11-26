
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import API from '../services/api'

function EditEvent() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    category: '',
    venue: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    capacity: '',
    waitlist_capacity: 20,
    status: 'draft'
  })

  const [banner, setBanner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await API.get(`events/${eventId}/`)
        const event = response.data

        const toLocalDateTime = (value) => {
          if (!value) return ''

          const date = new Date(value)
          const offset = date.getTimezoneOffset() * 60000

          return new Date(date.getTime() - offset)
            .toISOString()
            .slice(0, 16)
        }

        setFormData({
          title: event.title || '',
          short_description: event.short_description || '',
          description: event.description || '',
          category: event.category || '',
          venue: event.venue || '',
          start_date: toLocalDateTime(event.start_date),
          end_date: toLocalDateTime(event.end_date),
          registration_deadline: toLocalDateTime(event.registration_deadline),
          capacity: event.capacity ?? '',
          waitlist_capacity: event.waitlist_capacity ?? 20,
          status: event.status || 'draft'
        })
      } catch (err) {
        setError('Unable to load event details.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const data = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value)
      })

      if (banner) {
        data.append('banner', banner)
      }

      await API.patch(`events/${eventId}/update/`, data)

      setMessage('Event updated successfully!')

      setTimeout(() => {
        navigate('/organizer-dashboard')
      }, 1000)

    } catch (err) {
      const errorData = err.response?.data

      if (errorData && typeof errorData === 'object') {
        setError(
          Object.entries(errorData)
            .map(([field, errors]) =>
              `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
            )
            .join(' | ')
        )
      } else {
        setError('Unable to update event. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <p>Loading event details...</p>
      </div>
    )
  }

  return (
    <div>
      <Navbar />

      <main>
        <h1>Edit Event</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label>Event Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Short Description</label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Full Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>

          <div>
            <label>Category</label>
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Venue</label>
            <input
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Start Date</label>
            <input
              type="datetime-local"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>End Date</label>
            <input
              type="datetime-local"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Registration Deadline</label>
            <input
              type="datetime-local"
              name="registration_deadline"
              value={formData.registration_deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Event Capacity</label>
            <input
              type="number"
              name="capacity"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Waitlist Capacity</label>
            <input
              type="number"
              name="waitlist_capacity"
              min="0"
              value={formData.waitlist_capacity}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Replace Banner (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBanner(e.target.files[0])}
            />
          </div>

          <div>
            <label>Event Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button type="submit" disabled={saving}>
            {saving ? 'Updating...' : 'Update Event'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/organizer-dashboard')}
          >
            Back to Dashboard
          </button>
        </form>
      </main>
    </div>
  )
}

export default EditEvent
