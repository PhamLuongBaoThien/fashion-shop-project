const UserRouter = require("../routes/UserRouter");
const ProductRouter = require("../routes/ProductRouter");
const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
};
//   app.use("/api/orders", require("./orders"));

module.exports = routes;
