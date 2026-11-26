import { useContext } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'


function LandingPage() {
	const { isAuthenticated } = useContext(AuthContext)

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }
  return (
    <div>
      {/* Navigation */}
      <header>
        <h2>EMR</h2>

        <nav>
          <a href="#about">About</a>
          <a href="#benefits">Benefits</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section>
          <h1>Discover. Connect. Participate.</h1>

          <p>
            Explore exciting events, connect with communities,
            and make every experience memorable.
          </p>

          <Link to="/register">Get Started</Link>
          <Link to="/login">Login</Link>
        </section>

        {/* About Section */}
        <section id="about">
          <h2>About EMR</h2>

          <p>
            EMR is an event management and registration platform
            that brings participants and organizers together.
            Discover events, register easily, and manage your
            event experiences in one place.
          </p>
        </section>

        {/* Benefits Section */}
        <section id="benefits">
          <h2>Why Choose EMR?</h2>

          <div>
            <h3>Discover Events</h3>
            <p>Find interesting events happening around you.</p>
          </div>

          <div>
            <h3>Easy Registration</h3>
            <p>Register for events and manage your participation.</p>
          </div>

          <div>
            <h3>Smart Waiting List</h3>
            <p>Join waiting lists when events reach their capacity.</p>
          </div>

          <div>
            <h3>Organize Events</h3>
            <p>Create and manage events after organizer approval.</p>
          </div>
        </section>

        {/* Call to Action */}
        <section>
          <h2>Ready to Get Started?</h2>

          <p>
            Join EMR and become part of exciting experiences.
          </p>

          <Link to="/register">Create Your Account</Link>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <p>© 2026 EMR. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default LandingPage
