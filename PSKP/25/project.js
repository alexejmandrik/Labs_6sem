const jayson = require('jayson');

const server = new jayson.Server({

  sum: function(args, callback) {
    if (!Array.isArray(args) || args.length === 0) {
      return callback({ code: -32602, message: "Invalid params" });
    }

    const result = args. ((acc, val) => acc + Number(val), 0);
    callback(null, result);
  },

  mul: function(args, callback) {
    if (!Array.isArray(args) || args.length === 0) {
      return callback({ code: -32602, message: "Invalid params" });
    }

    const result = args.reduce((acc, val) => acc * Number(val), 1);
    callback(null, result);
  },

  div: function(args, callback) {
    const [x, y] = args;

    if (y === 0) {
      return callback({ code: -32000, message: "Division by zero" });
    }

    callback(null, x / y);
  },

  proc: function(args, callback) {
    const [x, y] = args;

    if (y === 0) {
      return callback({ code: -32000, message: "Division by zero" });
    }

    callback(null, (x / y) * 100);
  }

});

server.http().listen(3000, () => {
  console.log("JSON-RPC server running on http://localhost:3000");
});