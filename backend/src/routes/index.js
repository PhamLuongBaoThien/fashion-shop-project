const UserRouter = require("../routes/UserRouter");
const ProductRouter = require("../routes/ProductRouter");
const CategoryRouter = require("../routes/CategoryRouter");
const CartRouter = require("./CartRouter");
const OrderRouter = require("./OrderRoutes");
const PaymentRouter = require("./PaymentRouter");
const RoleRouter = require("../routes/RoleRouter");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/category", CategoryRouter);
  app.use("/api/cart", CartRouter);
  app.use("/api/orders",OrderRouter);
  app.use("/api/payment", PaymentRouter);
  app.use("/api/role", RoleRouter);
};
//   app.use("/api/orders", require("./orders"));

module.exports = routes;
