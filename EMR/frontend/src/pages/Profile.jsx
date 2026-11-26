
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import API from '../services/api'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [profilePicture, setProfilePicture] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('accounts/me/')

        setProfile(response.data)
        setPhoneNumber(response.data.profile?.phone_number || '')
      } catch (err) {
        setError('Unable to load your profile.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Update profile
  const handleSubmit = async (e) => {
    e.preventDefault()

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const formData = new FormData()

      formData.append('phone_number', phoneNumber)

      if (profilePicture) {
        formData.append('profile_picture', profilePicture)
      }

      await API.patch('accounts/profile/update/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Fetch updated profile
      const response = await API.get('accounts/me/')
      setProfile(response.data)
      setPhoneNumber(response.data.profile?.phone_number || '')
      setProfilePicture(null)

      setMessage('Profile updated successfully!')
    } catch (err) {
      const errorData = err.response?.data

      setError(
        errorData?.phone_number?.[0] ||
        errorData?.profile_picture?.[0] ||
        errorData?.detail ||
        'Unable to update profile. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Navbar />

      <main>
        <h1>My Profile</h1>
        <p>View and manage your account information.</p>

        {loading && <p>Loading profile...</p>}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && profile && (
          <section>
            <h2>Personal Information</h2>

            <p>Username: {profile.username}</p>

            <p>Email: {profile.email}</p>

            {profile.profile?.profile_picture && (
              <div>
                <h3>Current Profile Picture</h3>

                <img
                  src={profile.profile.profile_picture}
                  alt="Profile"
                  width="150"
                  height="150"
                  style={{ objectFit: 'cover', borderRadius: '50%' }}
                />
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div>
                <label>Phone Number</label>

                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label>Upload Profile Picture</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProfilePicture(e.target.files[0] || null)
                  }
                />
              </div>

              {profilePicture && (
                <p>Selected file: {profilePicture.name}</p>
              )}

              <button type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update Profile'}
              </button>
            </form>

            {message && (
              <p style={{ color: 'green' }}>{message}</p>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default Profile
