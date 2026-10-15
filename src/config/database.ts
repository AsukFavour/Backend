import dns from "node:dns";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

// Some local setups (VPNs, ad blockers, Docker) make Node use 127.0.0.1 as its
// DNS server, which can't resolve the SRV records that mongodb+srv:// needs.
// If that's the case, fall back to public DNS servers.
const usesLocalhostDns = dns
  .getServers()
  .every((server) => server.startsWith("127.") || server === "::1");
if (usesLocalhostDns) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI?.replace(/\/+$/, "");
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const connectionInstance = await mongoose.connect(`${mongoUri}/${DB_NAME}`);
    console.log(
      `MongoDB connected successfully: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};