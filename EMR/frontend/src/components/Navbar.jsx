
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access')
  )

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')

    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <nav>
      <div>
        <Link to="/">EMR</Link>
      </div>

      <div>
        {isAuthenticated ? (
          <>
            <Link to="/home">Home</Link>
            <Link to="/events">Events</Link>

            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
