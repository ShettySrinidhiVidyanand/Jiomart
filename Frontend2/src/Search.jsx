import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


function Search() {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    if (query) {
      fetch(`http://localhost:5000/search?q=${query}`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) => console.log(err));
    }
  }, [query]);

  return (
    <div className="search-container">
      <h2>Search Results for "{query}"</h2>

      <div className="product-list">
        {products.length === 0 ? (
          <p>No products found</p>
        ) : (
          products.map((item) => (
            <div
              key={item._id}
              className="product-card"
              onClick={() => navigate(`/product/${item._id}`)}
            >
              <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} />
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
              <p>{item.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Search;