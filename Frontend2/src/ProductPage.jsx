import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProductPage.css";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate(); 

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get(`https://jiomart-backend-w3pb.onrender.com/product/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch((err) => console.log(err));
  }, [id]);

  if (!product) return <p>Loading product...</p>;

  const addToCart = () => {

    if (!user) {
      alert("Please login first");
      return;
    }

    axios.post("https://jiomart-backend-w3pb.onrender.com/addToCart", {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,  
      userId: user.userId   
    })
    .then(() => {
      alert("Product added to cart");
    })
    .catch(err => {
      console.log("Add to cart error:", err);
    });
  };

  return (
    <div className="product-page-container">

      <div className="product-image-section">
        <img
          src={`http://localhost:5000/uploads/${product.image}`}
          alt={product.name}
        />
      </div>

      <div className="product-info-section">
        <h1>{product.name}</h1>
        <h2>{product.category}</h2>

        <p>₹{product.price}</p>

        <div>
          <label>
            Quantity:
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value)))
              }
            />
          </label>

          <button onClick={addToCart}>
            Add to Cart
          </button>
        </div>

        <div>
          <h3>About Product</h3>
          <p>{product.description}</p>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
