import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link,useNavigate } from "react-router-dom";

import "./ManageProduct.css";

function ManageProduct() {

  const [products, setProducts] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleDelete = (id) => {

  if(window.confirm("Are you sure you want to delete this product?")){

    axios.delete(`${import.meta.env.VITE_API_URL}/deleteProduct/${id}`)
    .then(() => {

      alert("Product Deleted");

      setProducts(products.filter(product => product._id !== id));

    })
    .catch(err => console.log(err));

  }

};


  return (
    <div className="manage-container">

      <h2>Manage Products</h2>

      <button
        className="back-button"
        onClick={() => navigate("/AdminDashboard")}
      >
        Back
      </button>

      <table className="product-table">

        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Ie</th>
            <th>Description</th>
            <th>Category</th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {products.map((product) => (

            <tr key={product._id}>

            <td>
                <img
                  src={product.image}
                  alt={product.name}
                  width="60"
                />
              </td>
              <td>{product.name}</td>
              <td>{product.quantity}</td>
              <td>{product.price}</td>
              <td>{product.description}</td>
              <td>{product.category}</td>

              <td>
                <Link to={`/UpdateProduct/${product._id}`} className="edit-btn">
                    Edit
                </Link>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(product._id)}>
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default ManageProduct;
