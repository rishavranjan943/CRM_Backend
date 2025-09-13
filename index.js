import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";



dotenv.config();

import connectDB from "./db.js";
import passport from "./config/passport.js";
import { authMiddleware } from "./middleware/auth.js";


import authRouter from './routes/auth.js'
import customersRouter from "./routes/customer.js";
import ordersRouter from "./routes/order.js";
import segmentsRouter from "./routes/segments.js";
import campaignsRouter from "./routes/campaigns.js";
import vendorRouter from "./routes/vendor.js"
import receiptsRouter from "./routes/receipts.js"
import { startReceiptConsumer } from "./utils/receiptConsumer.js";
import aiRouter from "./routes/ai.js";








await connectDB();


const app = express();


app.use(cors());
app.use(express.json());
app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: false }));
app.use(passport.initialize());


app.use("/api/auth", authRouter);



app.use("/api/customers", authMiddleware,customersRouter);
app.use("/api/orders", authMiddleware,ordersRouter);
app.use("/api/segments", authMiddleware, segmentsRouter);
app.use("/api/campaigns", authMiddleware, campaignsRouter);
app.use("/api/vendor", vendorRouter);
app.use("/api/receipts", receiptsRouter);
app.use("/api/ai", aiRouter);






app.get("/health", (req, res) => res.json({ ok: true, ts: Date.now() }))



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

startReceiptConsumer();

