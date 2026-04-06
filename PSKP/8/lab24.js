const express = require('express');
const { createClient } = require('webdav');
const multer = require('multer');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });


const client = createClient(
    "https://webdav.yandex.ru", 
    {
        username: "alexej.mandrik.2005",
        password: "vkkzksizelqrazna"
    }
);

app.post('/md/:name', async (req, res) => {
    try {
        await client.createDirectory(`/${req.params.name}`);
        res.send("Directory created");
    } catch (e) {
        res.status(408).send("Directory exists or error");
    }
});

app.post('/rd/:name', async (req, res) => {
    try {
        await client.deleteFile(`/${req.params.name}`);
        res.send("Directory removed");
    } catch (e) {
        res.status(408).send("Directory not found");
    }
});

app.post('/up/:name', upload.single('file'), async (req, res) => {
    try {
        const data = fs.readFileSync(req.file.path);
        await client.putFileContents(`/${req.params.name}`, data, { overwrite: true });

        fs.unlinkSync(req.file.path);
        res.send("File uploaded");
    } catch (e) {
        res.status(408).send("Upload error");
    }
});

app.post('/down/:name', async (req, res) => {
    try {
        const data = await client.getFileContents(`/${req.params.name}`);
        res.send(data);
    } catch (e) {
        res.status(404).send("File not found");
    }
});

app.post('/del/:name', async (req, res) => {
    try {
        await client.deleteFile(`/${req.params.name}`);
        res.send("File deleted");
    } catch (e) {
        res.status(404).send("File not found");
    }
});

app.post('/copy/:src/:dest', async (req, res) => {
    try {
        await client.copyFile(`/${req.params.src}`, `/${req.params.dest}`);
        res.send("File copied");
    } catch (e) {
        res.status(408).send("Copy error");
    }
});

app.post('/move/:src/:dest', async (req, res) => {
    try {
        await client.moveFile(`/${req.params.src}`, `/${req.params.dest}`);
        res.send("File moved");
    } catch (e) {
        res.status(408).send("Move error");
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));