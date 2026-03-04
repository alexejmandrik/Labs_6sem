const userModel = require('../models/userModel');

exports.getUsers = (req, res) => {
    res.json(userModel.getAll());
};

exports.createUser = (req, res) => {
    const user = req.body;
    userModel.add(user);
    res.status(201).json({ message: "User created" });
};

exports.updateUser = (req, res) => {
    const id = req.params.id;
    const user = req.body;
    userModel.update(id, user);
    res.json({ message: "User updated" });
};

exports.deleteUser = (req, res) => {
    const id = req.params.id;
    userModel.remove(id);
    res.json({ message: "User deleted" });
};