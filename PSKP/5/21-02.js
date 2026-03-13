const express = require('express')
const passport = require('passport')
const DigestStrategy = require('passport-http').DigestStrategy

const users = require('./users.json').users

const app = express()

passport.use(new DigestStrategy(
  { qop: 'auth' },

  function (username, done) {

    const user = users.find(u => u.username === username)

    if (!user) {
      return done(null, false)
    }

    return done(null, user, user.password)
  },

  function (params, done) {
    done(null, true)
  }
))

app.use(passport.initialize())

app.get('/login',
  passport.authenticate('digest', { session: false }),
  (req, res) => {
    res.send("Digest login successful")
  }
)
app.get('/resource',
  passport.authenticate('digest', { session: false }),
  (req, res) => {
    res.send("RESOURCE")
  }
)

app.get('/logout', (req, res) => {
  res.set('WWW-Authenticate', 'Digest realm="Users", qop="auth", nonce="logout", opaque="logout"')
  res.status(401).send("Logout выполнен")
})

app.use((req, res) => {
  res.status(404).send("404 Not Found")
})

app.listen(3000, () => {
  console.log("Server DIGEST started on port 3000")
})