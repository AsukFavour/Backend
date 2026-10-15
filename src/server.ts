import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Docs check: http://localhost:${PORT}/api/users/register`);
      console.log(`Docs check: http://localhost:${PORT}/api/users/login`);
      console.log(`Docs check: http://localhost:${PORT}/api/users/logout`);
      console.log(`Docs check: http://localhost:${PORT}/api/users`);
      console.log(`Docs check: http://localhost:${PORT}/api/users/:id`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error);
    process.exit(1);
  });