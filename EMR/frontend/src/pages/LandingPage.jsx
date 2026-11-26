
function LandingPage() {
  return (
    <div>
      <header>
        <h1>EMR</h1>
        <nav>
          <a href="#about">About</a>
          <a href="#events">Events</a>
          <a href="/login">Login</a>
          <a href="/register">Get Started</a>
        </nav>
      </header>

      <main>
        <section>
          <h1>Discover. Connect. Participate.</h1>
          <p>
            Explore exciting events, connect with communities,
            and make every experience memorable.
          </p>
          <a href="/register">Get Started</a>
          <a href="/events">Explore Events</a>
        </section>

        <section id="about">
          <h2>About EMR</h2>
          <p>
            A platform to discover events, manage registrations,
            and bring communities together.
          </p>
        </section>

        <section id="events">
          <h2>Discover Events</h2>
          <p>Find events that match your interests.</p>
        </section>
      </main>

      <footer>
        <p>© 2026 EMR. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default LandingPage

