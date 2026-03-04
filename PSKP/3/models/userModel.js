let users = [];

exports.getAll = () => users;

exports.add = (user) => {
    users.push(user);
};

exports.update = (id, newUser) => {
    users[id] = newUser;
};

exports.remove = (id) => {
    users.splice(id, 1);
};