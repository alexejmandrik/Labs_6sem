const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')

const users = require('./users.json').users

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))

function authMiddleware(req, res, next) {
  if (req.session.user) {
    return next()
  }
  res.redirect('/login')
}

app.get('/login', (req, res) => {
  res.send(`
    <form method="POST" action="/login">
      <input name="username" placeholder="login"/><br>
      <input name="password" type="password" placeholder="password"/><br>
      <button type="submit">Login</button>
    </form>
  `)
})

app.post('/login', (req, res) => {

  const { username, password } = req.body

  const user = users.find(u => u.username === username && u.password === password)

  if (!user) {
    return res.send("Invalid login")
  }

  req.session.user = user
  res.redirect('/resource')
})

app.get('/resource', authMiddleware, (req, res) => {
  res.send("RESOURCE")
})

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})

app.use((req, res) => {
  res.status(404).send("404 Not Found")
})

app.listen(3000, () => {
  console.log("Server FORMS started on port 3000")
})