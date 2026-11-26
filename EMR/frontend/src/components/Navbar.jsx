
import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'


function Navbar() {
  const navigate = useNavigate()

const { isAuthenticated, setIsAuthenticated } =
    useContext(AuthContext)

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
			<Link to="/my-registrations">My Registrations</Link>
			<Link to="/profile">My Profile</Link>
			<Link to="/organizer-application">Organizer</Link>
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
