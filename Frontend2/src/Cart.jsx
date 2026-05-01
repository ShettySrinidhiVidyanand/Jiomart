import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";

function Cart() {

  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
  if (!user || !user.userId) {
    console.log("User not found");
    return;
  }

  axios.get(`${import.meta.env.VITE_API_URL}/cart/${user.userId}`)
    .then(res => setCart(res.data))
    .catch(err => console.log(err));

}, [user]);

  const removeItem = (id) => {
    axios.delete(`${import.meta.env.VITE_API_URL}/cart/${id}`)
      .then(() => {
        setCart(cart.filter(item => item._id !== id));
      });
  };

  const updateQuantity = (id, qty) => {
    axios.put(`${import.meta.env.VITE_API_URL}/cart/${id}`, {
      quantity: Math.max(1, qty)
    })
    .then(res => {
      setCart(cart.map(item =>
        item._id === id ? res.data.item : item
      ));
    });
  };

  const placeOrder = () => {
    navigate("/checkout");
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-container">

      <div className="cart-left">

        <div className="cart-header">
          <h2>My Cart</h2>
          <button onClick={() => navigate("/")}>Back</button>
        </div>

        {cart.length === 0 ? (
          <h3>No items in cart</h3>
        ) : (
          cart.map((item) => (
            <div className="cart-card" key={item._id}>

              <img src={item.image} alt={item.name} />

              <div className="cart-info">
                <h3>{item.name}</h3>
                <p>₹{item.price}</p>

                <div>
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>

                <p>Total: ₹{item.price * item.quantity}</p>

                <button onClick={() => removeItem(item._id)}>
                  Remove
                </button>

                <button onClick={placeOrder}>
                  Place Order
                </button>

              </div>

            </div>
          ))
        )}

      </div>

      <div className="cart-right">
        <h3>Total: ₹{total}</h3>
      </div>

    </div>
  );
}

export default Cart;
