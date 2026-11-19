
const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order
app.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;

        if (!Number.isInteger(amount) || amount < 1) {
    return res.status(400).json({
        error: "Minimum payment is ₹1"
    });
}

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt_" + Date.now()
        });

        res.json(order);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify payment
const crypto = require("crypto");

app.post("/verify-payment", (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    const isValid = generatedSignature === razorpay_signature;

    res.json({
        success: isValid,
        message: isValid
            ? "Payment verified successfully!"
            : "Payment verification failed!"
    });
});

app.listen(process.env.PORT || 5000, () => {
    console.log("Backend running on port 5000");
});
