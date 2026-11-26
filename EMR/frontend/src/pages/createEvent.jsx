
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import API from '../services/api'

function CreateEvent() {
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
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

      const response = await API.post('events/create/', data)

      setMessage('Event created successfully!')

      console.log('Created Event:', response.data)

      setTimeout(() => {
        navigate('/organizer-dashboard')
      }, 1000)

    } catch (err) {
      console.error(err.response?.data)

      const errorData = err.response?.data

      if (typeof errorData === 'object' && errorData !== null) {
        const messages = Object.entries(errorData)
          .map(([field, errors]) => {
            const detail = Array.isArray(errors)
              ? errors.join(', ')
              : String(errors)

            return `${field}: ${detail}`
          })

        setError(messages.join(' | '))
      } else {
        setError('Unable to create event. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />

      <main>
        <h1>Create Event</h1>
        <p>Fill in the details to create your event.</p>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">

          <div>
            <label>Event Title</label>
            <input
              type="text"
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
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Workshop, Seminar, Conference..."
              required
            />
          </div>

          <div>
            <label>Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Start Date and Time</label>
            <input
              type="datetime-local"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>End Date and Time</label>
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
            <label>Event Banner</label>
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

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>

        </form>
      </main>
    </div>
  )
}

export default CreateEvent
