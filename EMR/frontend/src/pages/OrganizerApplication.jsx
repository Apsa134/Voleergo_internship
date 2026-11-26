
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import API from '../services/api'

function OrganizerApplication() {
  const [formData, setFormData] = useState({
    organization_name: '',
    reason: ''
  })

  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Fetch existing application
  const fetchApplication = async () => {
    try {
      const response = await API.get(
        'accounts/organizer/my-application/'
      )

      const data = response.data

      if (Array.isArray(data)) {
        setApplication(data.length > 0 ? data[0] : null)
      } else {
        setApplication(data?.id ? data : null)
      }
    } catch (err) {
      setError('Unable to load your application status.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplication()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Submit organizer application
  const handleSubmit = async (e) => {
    e.preventDefault()

    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await API.post('accounts/organizer/apply/', formData)

      setMessage('Organizer application submitted successfully!')

      setFormData({
        organization_name: '',
        reason: ''
      })

      await fetchApplication()

    } catch (err) {
      const errorData = err.response?.data

      setError(
        errorData?.error ||
        errorData?.detail ||
        'Unable to submit application. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Navbar />

      <main>
        <h1>Organizer Application</h1>

        <p>
          Apply for organizer access to create and manage events.
        </p>

        {loading && <p>Loading application details...</p>}

        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}

        {message && (
          <p style={{ color: 'green' }}>{message}</p>
        )}

        {!loading && application && (
          <section>
            <h2>Application Status</h2>

            <p>
              Organization: {application.organization_name}
            </p>

            <p>
              Status: {application.status}
            </p>

            {application.status === 'pending' && (
              <p>
                Your application is waiting for administrator approval.
              </p>
            )}

            {application.status === 'approved' && (
              <p>
                Congratulations! Your organizer application has been approved.
              </p>
            )}

            {application.status === 'rejected' && (
              <p>
                Your application was rejected. You can continue using
                the platform as a participant.
              </p>
            )}
          </section>
        )}

        {!loading && !application && (
          <section>
            <h2>Apply for Organizer Access</h2>

            <form onSubmit={handleSubmit}>
              <div>
                <label>Organization Name</label>

                <input
                  type="text"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div>
                <label>Reason for Applying</label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Explain why you want organizer access"
                  rows="5"
                  required
                />
              </div>

              <button type="submit" disabled={submitting}>
                {submitting
                  ? 'Submitting...'
                  : 'Submit Application'}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  )
}

export default OrganizerApplication
