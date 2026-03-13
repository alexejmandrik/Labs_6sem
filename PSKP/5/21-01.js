const express = require('express')
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy

const users = require('./users.json').users

const app = express()

passport.use(new BasicStrategy(
  function (username, password, done) {

    const user = users.find(u => u.username === username && u.password === password)

    if (!user) {
      return done(null, false)
    }

    return done(null, user)
  }
))

app.use(passport.initialize())

app.get('/login',
  passport.authenticate('basic', { session: false }),
  (req, res) => {
    res.send("Авторизация успешна")
  }
)

app.get('/resource',
  passport.authenticate('basic', { session: false }),
  (req, res) => {
    res.send("RESOURCE")
  }
)

app.get('/logout', (req, res) => {
  res.set('WWW-Authenticate', 'Basic realm="Users"')
  res.status(401).send("Logout выполнен. Требуется повторная авторизация")
})

app.use((req, res) => {
  res.status(404).send("404 Not Found")
})

app.listen(3000, () => {
  console.log("Server BASIC started on port 3000")
})