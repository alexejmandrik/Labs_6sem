const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('MAIDB', 'MAI', '1234', {
    host: 'localhost',
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    },
    logging: false
});

const Faculty = sequelize.define('FACULTY', {
    FACULTY: { type: DataTypes.STRING, primaryKey: true },
    FACULTY_NAME: DataTypes.STRING
}, { tableName: 'FACULTY', timestamps: false });

const Pulpit = sequelize.define('PULPIT', {
    PULPIT: { type: DataTypes.STRING, primaryKey: true },
    PULPIT_NAME: DataTypes.STRING,
    FACULTY: DataTypes.STRING
}, { tableName: 'PULPIT', timestamps: false });

const Subject = sequelize.define('SUBJECT', {
    SUBJECT: { type: DataTypes.STRING, primaryKey: true },
    SUBJECT_NAME: DataTypes.STRING,
    PULPIT: DataTypes.STRING
}, { tableName: 'SUBJECT', timestamps: false });

const AuditoriumType = sequelize.define('AUDITORIUM_TYPE', {
    AUDITORIUM_TYPE: { type: DataTypes.STRING, primaryKey: true },
    AUDITORIUM_TYPENAME: DataTypes.STRING
}, { tableName: 'AUDITORIUM_TYPE', timestamps: false });

const Auditorium = sequelize.define('AUDITORIUM', {
    AUDITORIUM: { type: DataTypes.STRING, primaryKey: true },
    AUDITORIUM_NAME: DataTypes.STRING,
    AUDITORIUM_TYPE: DataTypes.STRING
}, { tableName: 'AUDITORIUM', timestamps: false });

const Teacher = sequelize.define('TEACHER', {
    TEACHER: { type: DataTypes.STRING, primaryKey: true },
    TEACHER_NAME: DataTypes.STRING,
    PULPIT: DataTypes.STRING
}, { tableName: 'TEACHER', timestamps: false });

function sendJSON(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

function getBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
    });
}

    Pulpit.belongsTo(Faculty, { foreignKey: 'FACULTY', as: 'faculty' });
    Faculty.hasMany(Pulpit, { foreignKey: 'FACULTY', as: 'pulpits' });

    Subject.belongsTo(Pulpit, { foreignKey: 'PULPIT', as: 'pulpit' });
    Pulpit.hasMany(Subject, { foreignKey: 'PULPIT', as: 'subjects' });

    Teacher.belongsTo(Pulpit, { foreignKey: 'PULPIT', as: 'pulpit' });
    Pulpit.hasMany(Teacher, { foreignKey: 'PULPIT', as: 'teachers' });

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    try {
        await sequelize.authenticate();

        if (req.method === 'GET') {
            if (pathname === '/') {
                const filePath = path.join(__dirname, 'index.html');
                return fs.readFile(filePath, (err, data) => {
                    if (err) return sendJSON(res, 500, { error: 'File error' });
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(data);
                });
            }

            if (pathname === '/api/faculties')
                return sendJSON(res, 200, await Faculty.findAll());

            if (pathname === '/api/pulpits')
                return sendJSON(res, 200, await Pulpit.findAll({
                    include: [{ model: Faculty, as: 'faculty' }]
            }));

            if (pathname === '/api/subjects') {
                const subjects = await Subject.findAll({
                include: [{model: Pulpit, as: 'pulpit', include: [{model: Faculty, as: 'faculty'}]}]
                });
                return sendJSON(res, 200, subjects);
            }

            if (pathname === '/api/auditoriumstypes')
                return sendJSON(res, 200, await AuditoriumType.findAll());

            if (pathname === '/api/auditorims')
                return sendJSON(res, 200, await Auditorium.findAll());

            if (pathname === '/api/teachers') {
                const teachers = await Teacher.findAll({
                    include: [{model: Pulpit, as: 'pulpit', include: [{model: Faculty, as: 'faculty'}]}]
            });
    return sendJSON(res, 200, teachers);
}
        }

        if (req.method === 'POST') {
            const body = await getBody(req);

            if (pathname === '/api/faculties')
                return sendJSON(res, 200, await Faculty.create(body));

            if (pathname === '/api/pulpits')
                return sendJSON(res, 200, await Pulpit.create(body));

            if (pathname === '/api/subjects')
                return sendJSON(res, 200, await Subject.create(body));

            if (pathname === '/api/auditoriumstypes')
                return sendJSON(res, 200, await AuditoriumType.create(body));

            if (pathname === '/api/auditoriums')
                return sendJSON(res, 200, await Auditorium.create(body));
            if (pathname === '/api/teachers') {
                return sendJSON(res, 200, await Teacher.create(body));
}
        }

        if (req.method === 'PUT') {
            const body = await getBody(req);

            if (pathname === '/api/faculties') {
                await Faculty.update(body, { where: { FACULTY: body.FACULTY } });
                return sendJSON(res, 200, body);
            }

            if (pathname === '/api/pulpits') {
                await Pulpit.update(body, { where: { PULPIT: body.PULPIT } });
                return sendJSON(res, 200, body);
            }

            if (pathname === '/api/subjects') {
                await Subject.update(body, { where: { SUBJECT: body.SUBJECT } });
                return sendJSON(res, 200, body);
            }

            if (pathname === '/api/auditoriumstypes') {
                await AuditoriumType.update(body, { where: { AUDITORIUM_TYPE: body.AUDITORIUM_TYPE } });
                return sendJSON(res, 200, body);
            }

            if (pathname === '/api/auditorims') {
                await Auditorium.update(body, { where: { AUDITORIUM: body.AUDITORIUM } });
                return sendJSON(res, 200, body);
            }
            if (pathname === '/api/teachers') {
                await Teacher.update(body, { where: { TEACHER: body.TEACHER } });
                return sendJSON(res, 200, body);
}
        }

        if (req.method === 'DELETE') {
            const parts = pathname.split('/');
            if (parts.length === 4) {
                const entity = parts[2];
                const id = parts[3];

                if (entity === 'faculties')
                    return sendJSON(res, 200, await Faculty.destroy({ where: { FACULTY: id } }));

                if (entity === 'pulpits')
                    return sendJSON(res, 200, await Pulpit.destroy({ where: { PULPIT: id } }));

                if (entity === 'subjects')
                    return sendJSON(res, 200, await Subject.destroy({ where: { SUBJECT: id } }));

                if (entity === 'auditoriumtypes')
                    return sendJSON(res, 200, await AuditoriumType.destroy({ where: { AUDITORIUM_TYPE: id } }));

                if (entity === 'auditorims')
                    return sendJSON(res, 200, await Auditorium.destroy({ where: { AUDITORIUM: id } }));

                if (entity === 'teachers')
                    return sendJSON(res, 200, await Teacher.destroy({ where: { TEACHER: id } }));
            }
        }

        sendJSON(res, 404, { error: 'Not found' });
    }
    catch (err) {
        sendJSON(res, 500, { error: err.message });
    }
});

server.listen(3000, () => {
    console.log('Server started: http://localhost:3000');
});