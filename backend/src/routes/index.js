const UserRouter = require("../routes/UserRouter");
const ProductRouter = require("../routes/ProductRouter");
const CategoryRouter = require("../routes/CategoryRouter");
const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/category", CategoryRouter);
};
//   app.use("/api/orders", require("./orders"));

module.exports = routes;
