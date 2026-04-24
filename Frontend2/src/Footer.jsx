import "./Footer.css";

function Footer() {
  return (
    <div className="footer">

      <div className="footer-container">

        <div className="footer-column">
          <h4>All Categories</h4>
          <p>Grocery</p>
          <p>Electronics</p>
          <p>Fashion</p>
          <p>Home & Lifestyle</p>
          <p>Premium Fruits</p>
          <p>Books</p>
          <p>Furniture</p>
        </div>

        <div className="footer-column">
          <h4>Popular Categories</h4>
          <p>Biscuits, Drinks & Packaged Foods</p>
          <p>Fruits & Vegetables</p>
          <p>Cooking Essentials</p>
          <p>Dairy & Bakery</p>
          <p>Personal Care</p>
          <p>Beauty</p>
          <p>Home</p>
          <p>Mom & Baby Care</p>
          <p>School, Office & Stationery</p>
        </div>

        <div className="footer-column">
          <h4>Customer Account</h4>
          <p>My Account</p>
          <p>My Orders</p>
          <p>Wishlist</p>
          <p>Delivery Addresses</p>
          <p>JioMart Wallet</p>
        </div>


        <div className="footer-column">
          <h4>Help & Support</h4>
          <p>About Us</p>
          <p>FAQ</p>
          <p>Terms & Conditions</p>
          <p>Privacy Policy</p>
          <p>E-waste Policy</p>
          <p>Cancellation & Return Policy</p>
          <p>Shipping & Delivery Policy</p>
        </div>


        <div className="footer-column">
          <h4>Contact Us</h4>
          <p>WhatsApp us: 70003 70003</p>
          <p>Call us: 1800 890 1222</p>
          <p>8:00 AM to 8:00 PM, 365 days</p>

          <br />

          <h4>Download the app</h4>
          <div className="app-buttons">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
              alt="Google Play"
            />
            <img 
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
              alt="App Store"
            />
          </div>
        </div>

      </div>

    </div>
  );
}

export default Footer;