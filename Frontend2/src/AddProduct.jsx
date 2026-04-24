import { useState } from "react";
import axios from "axios";
import "./AddProduct.css";

function AddProduct() {

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("image", image);

    try {
      console.log("Sending Data...");
      console.log("Image:", image);

      const res = await axios.post(
        "http://localhost:5000/products",
        formData
      );

      alert(res.data.message);

      setName("");
      setPrice("");
      setQuantity("");
      setCategory("");
      setDescription("");
      setImage(null);

    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      alert("Failed to add product");
    }
  };

  return (
    <div className="addproduct-container">

      <div className="addproduct-card">

        <h2>Add Product</h2>

        <form onSubmit={handleSubmit} encType="multipart/form-data">

          <input
            type="text"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Enter product price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            <option value="Groceries">Groceries</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Home Appliances">Home Appliances</option>
          </select>

          <textarea
            placeholder="Enter product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />

          <button type="submit" className="btn">
            Add Product
          </button>

        </form>

      </div>

    </div>
  );
}

export default AddProduct;