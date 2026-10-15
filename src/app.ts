import express from "express";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", apiRoutes);

// Unknown routes -> JSON 404
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

export default app;
