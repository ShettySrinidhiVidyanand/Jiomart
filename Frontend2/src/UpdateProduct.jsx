import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./UpdateProduct.css";

function UpdateProduct(){

  const { id } = useParams();
  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [price,setPrice] = useState("");
  const [quantity,setQuantity] = useState("");
  const [category,setCategory] = useState("");
  const [description,setDescription] = useState("");
  const [image, setImage] = useState(null);

  useEffect(()=>{

    axios.get(`http://localhost:5000/product/${id}`)
    .then(res=>{
      setName(res.data.name);
      setPrice(res.data.price);
      setQuantity(res.data.quantity);
      setCategory(res.data.category);
      setDescription(res.data.description);
    })
    .catch(err=>console.log(err));

  },[id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("image", image);

    axios.put(`http://localhost:5000/updateProduct/${id}`, formData)
    .then(()=>{
      alert("Product Updated");
      navigate("/ManageProduct");
    })
    .catch(err=>
        console.log(err));
  }

  return(

    <div className="update-container">

      <h2>Edit Product</h2>

      <form onSubmit={handleSubmit}>

        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <label>Price</label>
        <input
          type="number"
          value={price}
          onChange={(e)=>setPrice(e.target.value)}
        />

        <label>Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e)=>setQuantity(e.target.value)}
        />

        <label>Category</label>
        <input
          type="text"
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
        />

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />
        <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />

        <button type="submit">
          Update Product
        </button>

      </form>

    </div>

  )
}

export default UpdateProduct;