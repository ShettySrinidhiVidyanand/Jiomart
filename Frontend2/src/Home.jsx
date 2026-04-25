import { useEffect, useState } from "react";
import axios from "axios";    
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {

  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios.get("https://jiomart-backend-w3pb.onrender.com/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  const addToCart = (item) => {

    if (!user) {
      alert("Please login first");
      return;
    }

    axios.post("https://jiomart-backend-w3pb.onrender.com/addToCart", {
      productId: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
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
    <div className="home-container">

      <h2>Products</h2>

      <div className="products-container">
      
        {products.map((product) => (

          <div className="product-card" key={product._id}>

            <img
              src={product.image}
              alt={product.name}
            />

            <h3>{product.name}</h3>
            <p>₹{product.price}</p>

            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>

            <button onClick={() => navigate(`/product/${product._id}`)}>
              View Details
            </button> 

          </div>

        ))}

      </div>

    </div>
  );
}

export default Home;
