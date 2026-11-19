
import { useState } from "react";
import "./App.css";

function App() {
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePayment(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Load Razorpay checkout
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      // Create order
      const response = await fetch(
        "http://localhost:5000/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(amount) })
        }
      );

      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.error || "Order creation failed");
      }

      // Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Student Payment Demo",
        description: "Mini Project Payment",
        order_id: order.id,

        prefill: {
          name,
          email
        },

        handler: async function (payment) {
          const result = await fetch(
            "http://localhost:5000/verify-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payment)
            }
          );

          const verification = await result.json();

          setMessage(
            verification.success
              ? "Payment successful and verified!"
              : "Payment verification failed!"
          );
        },

        theme: {
          color: "#2563a6"
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function () {
        setMessage("Payment failed. Please try again.");
      });

      razorpay.open();

    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Online Payment System</h1>
        <p>Razorpay Payment Gateway Integration</p>
      </header>

      <div className="payment-box">
        <h2>Make a Payment</h2>

        <form onSubmit={handlePayment}>
          <label>Customer Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label>Amount (INR)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>

      <footer>Powered by Razorpay Test Mode</footer>
    </div>
  );
}

export default App;
