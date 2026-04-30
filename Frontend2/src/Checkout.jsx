import { useEffect, useState } from "react";
import axios from "axios";
import "./Checkout.css";

function Checkout() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    pincode: "",
    address: "",
    email: ""
  });

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const fetchCartItems = () => {

    if (!user || !user.userId) {
      console.log("User not logged in");
      return;
    }

    axios
      .get(`http://localhost:5000/cart/${user.userId}`)
      .then((res) => setCartItems(res.data))
      .catch((err) => console.log(err));
  };

  const handleConfirmOrder = async () => {
    if (
      !address.name ||
      !address.phone ||
      !address.pincode ||
      !address.address ||
      !address.email
    ) {
      alert("Please fill all address fields");
      return;
    }

    if (paymentMethod === "Cash on Delivery") {
      axios
        .post("http://localhost:5000/createOrder", {
          paymentMethod,
          address,
          status: "Pending",
          changeStatus: "Pending",
          userId: user.userId
        })
        .then((res) => {
          alert(res.data.message);
          setCartItems([]);
        })
        .catch((err) => console.log(err));
    }


    else {
      try {
        const res = await axios.post(
          "http://localhost:5000/razorpayOrder",
          { userId: user.userId }
        );

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: res.data.amount * 100, 
          currency: "INR",
          name: "JioMart",
          description: "Order Payment",
          order_id: res.data.orderId,

          handler: async function (response) {
            if (response.razorpay_payment_id) {
              try {
                await axios.post("http://localhost:5000/createOrder", {
                  paymentMethod,
                  address,
                  status: "Paid",
                  changeStatus: "Pending",
                  userId: user.userId
                });

                alert("Payment Verified & Order Saved ");
                setCartItems([]);
              } catch (err) {
                console.log(err);
                alert("Order saving failed");
              }
            } else {
              alert("Payment verification failed ");
            }
          },

          prefill: {
            name: address.name,
            email: address.email,
            contact: address.phone
          },

          theme: {
            color: "#3399cc"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

        rzp.on("payment.failed", function (response) {
          console.log("ERROR FULL:", response);
          alert("Payment Failed: " + response.error.description);
        });

      } catch (err) {
        console.log(err);
        alert("Payment Failed");
      }
    }
  };

  const subtotal = cartItems.reduce(
  (total, item) => total + item.price * item.quantity,
  0
);

const GST_PERCENT = 18;

const gstAmount = (subtotal * GST_PERCENT) / 100;

const totalAmount = subtotal + gstAmount;

  return (
    <div className="checkout-container">

      <div className="checkout-products">
        <h2>Products</h2>

        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item._id} className="checkout-item">
              <img
                src={item.image}
                alt={item.name}
                width="80"
              />
              <div>
                <p><b>{item.name}</b></p>
                <p>Price: ₹{item.price}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Total: ₹{item.price * item.quantity}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No products in cart</p>
        )}

        <div className="bill-details">
          <p>Subtotal: ₹{subtotal}</p>
          <p>GST (18%): ₹{gstAmount.toFixed(2)}</p>
          <h3>Total Amount: ₹{totalAmount.toFixed(2)}</h3>
        </div>
      </div>

      <div className="checkout-payment">
        <h2>Shipping Details</h2>

        <input
          type="text"
          placeholder="Name"
          value={address.name}
          onChange={(e) =>
            setAddress({ ...address, name: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Phone"
          value={address.phone}
          onChange={(e) =>
            setAddress({ ...address, phone: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Pincode"
          value={address.pincode}
          onChange={(e) =>
            setAddress({ ...address, pincode: e.target.value })
          }
        />

        <textarea
          placeholder="Address"
          value={address.address}
          onChange={(e) =>
            setAddress({ ...address, address: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          value={address.email}
          onChange={(e) =>
            setAddress({ ...address, email: e.target.value })
          }
        />

        <h2>Payment Method</h2>

        <div className="payment-methods">
          {["Cash on Delivery", "UPI"].map((method) => (
            <button
              key={method}
              className={paymentMethod === method ? "active" : ""}
              onClick={() => setPaymentMethod(method)}
            >
              {method}
            </button>
          ))}
        </div>

        <button onClick={handleConfirmOrder}>
          Confirm Order
        </button>
      </div>

    </div>
  );
}

export default Checkout;
