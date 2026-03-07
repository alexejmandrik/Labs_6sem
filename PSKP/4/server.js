const express = require('express');
const fs = require('fs');
const path = require('path');
const { engine } = require('express-handlebars');

const app = express();
const PORT = 3000;
const FILE = path.join(__dirname, 'phonebook.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        cancelButton: function () {
            return '<a href="/">Отказаться</a>';
        }
    }
}));

app.set('view engine', 'handlebars');

function readData() {
    return JSON.parse(fs.readFileSync(FILE));
}

function writeData(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {
    res.render('home', { rows: readData() });
});

app.get('/Add', (req, res) => {
    res.render('add', { rows: readData() });
});

app.post('/Add', (req, res) => {
    const data = readData();
    const newId = Date.now();

    data.push({
        id: newId,
        name: req.body.name,
        phone: req.body.phone
    });

    writeData(data);
    res.redirect('/');
});

app.get('/Update', (req, res) => {
    const data = readData();
    const row = data.find(r => r.id == req.query.id);

    res.render('update', {
        rows: data,
        selected: row
    });
});

app.post('/Update', (req, res) => {
    const data = readData();
    const row = data.find(r => r.id == req.body.id);

    row.name = req.body.name;
    row.phone = req.body.phone;

    writeData(data);
    res.redirect('/');
});

app.post('/Delete', (req, res) => {
    let data = readData();
    data = data.filter(r => r.id != req.body.id);

    writeData(data);
    res.redirect('/');
});

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);