import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import { useState } from "react"; 
import Nav from "./components/Nav"; 
import Home from "./Home"; 
import Cart from "./Cart"; 
import Login from "./Login"; 
import SignUp from "./SignUp"; 
import Footer from "./Footer"; 
import AdminLogin from "./AdminLogin"; 
import AdminDashboard from "./AdminDashboard"; 
import AddProduct from "./AddProduct"; 
import ManageProduct from "./ManageProduct"; 
import Checkout from "./Checkout";
import ManageOrder from "./ManageOrder";
import UpdateProduct from "./UpdateProduct"; 
import CategoryCarousel from "./components/CategoryCarousel"; 
import BannerSlider from "./components/BannerSlider"; 
import ProductPage from "./ProductPage"; 
import Profile from "./components/Profile";


function App() { 
  const [cart, setCart] = useState([]); 
  return ( 
  <BrowserRouter> 
  <Nav /> 
  <Routes> 
    <Route path="/" element={ 
      <> 
      <CategoryCarousel /> 
      <BannerSlider /> 
      <Home cart={cart} setCart={setCart} /> 
      <Footer /> 
      </> 
      } 
    /> 
    <Route path="/Cart" element={<Cart cart={cart} setCart={setCart} />} /> 
    <Route path="/Login" element={<Login />} /> 
    <Route path="/SignUp" element={<SignUp />} /> 
    <Route path="/AdminLogin" element={<AdminLogin />} /> 
    <Route path="/AdminDashboard" element={<AdminDashboard />} /> 
    <Route path="/AddProduct" element={<AddProduct />} /> 
    <Route path="/ManageProduct" element={<ManageProduct />} /> 
    <Route path="/Checkout" element={<Checkout />} /> 
    <Route path="/ManageOrder" element={<ManageOrder />} />
    <Route path="/UpdateProduct/:id" element={<UpdateProduct />} /> 
    <Route path="/product/:id" element={<ProductPage />} /> 
    <Route path="/profile" element={<Profile />} />
    
  </Routes> 
</BrowserRouter> ); } 
export default App;