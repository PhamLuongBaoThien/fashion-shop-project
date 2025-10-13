const UserRouter = require("../routes/UserRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  };
//   app.use("/api/products", require("./products"));
//   app.use("/api/orders", require("./orders"));


module.exports = routes;