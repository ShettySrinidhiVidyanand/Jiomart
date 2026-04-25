const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


mongoose.connect(process.env.MONGO_URL,) 
.then(() => console.log("MongoDB Atlas Connected")) 
.catch((err) => console.log(err));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: { type: String, unique: true, sparse: true }
});
const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  category: String,
  description: String,
  image: String
});
const Product = mongoose.model("Product", productSchema);

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage, limits: { fileSize: 5000000 } });

const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "products",
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: Date.now() + "-" + file.originalname,
    };
  },
});

const upload = multer({ storage });

let otpStore = {};

const cartSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  name: String,
  price: Number,
  image: String,
  quantity: Number
});
const Cart = mongoose.model("Cart", cartSchema);

const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      image: String,
      quantity: Number
    }
  ],
  totalAmount: Number,
  paymentMethod: String,
  address: {
    name: String,
    phone: String,
    pincode: String,
    address: String,
    email: String
  },
  status: String,
  changeStatus: String
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

const Razorpay = require("razorpay");


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post("/SignUp", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    if (await User.findOne({ phone }))
      return res.status(400).json({ message: "Phone already registered" });

    await new User({ name, email, phone }).save();
    res.json({ message: "User Registered Successfully" });

  }catch (err) {
  console.log("SIGNUP ERROR:", err);
  res.status(500).json({ message: err.message });
  }
});

app.post("/Login", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    await transporter.sendMail({
      from: "shtynidhi@gmail.com",
      to: email,
      subject: "JioMart Login OTP",
      text: `Your OTP is ${otp}`
    });

    res.json({ message: "OTP sent to your email" });

  } catch {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/VerifyOTP", async (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    delete otpStore[email];

    const user = await User.findOne({ email });

    return res.json({
      message: "Login Successful",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email
      }
    });
  }

  res.status(400).json({ message: "Invalid OTP" });
});

app.post("/AdminLogin", (req, res) => {
  console.log("EMAIL:", req.body.email);
  console.log("PASSWORD:", req.body.password);

  const { email, password } = req.body;

  if (
  email.trim().toLowerCase() === "admin@gmail.com" &&
  password.trim() === "admin24"
) {
  return res.json({ message: "Admin Login Successful" });
}

  res.status(401).json({ message: "Invalid Admin Credentials" });
});

app.post("/products", upload.single("image"), async (req, res) => {
  try {
     console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("IMAGE URL:", req.file.path);

    const product = await Product.create({
      name: req.body.name,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      description: req.body.description,
      category: req.body.category,
      image: req.file ? req.file.path || req.file.secure_url : null
    });

    res.json({ message: "Product Added Successfully", product });

  } catch (err) {
    console.log("PRODUCT ERROR:", err); 
    res.status(500).json(err);
  }
});

app.get("/products", async (req, res) => {
  try {
    res.json(await Product.find());
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    res.json({
      message: "Product fetched successfully",
      product: await Product.findById(req.params.id)
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/updateProduct/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      category: req.body.category,
      description: req.body.description
    };

    if (req.file) updateData.image = req.file.path || req.file.secure_url;

    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: "Product Updated Successfully" });

  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/deleteProduct/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product Deleted Successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/addToCart", async (req, res) => {
  try {
    const { productId, name, price, image, quantity,userId } = req.body;

    const existingItem = await Cart.findOne({ productId ,userId});

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      await existingItem.save();
    } else {
      await new Cart({ productId, name, price: Number(price), image, quantity: Number(quantity), userId }).save();
    }

    res.json({ message: "Product added to cart" });

  } catch {
    res.status(500).json({ message: "Error adding to cart" });
  }
});

app.get("/cart/:userId", async (req, res) => {
  try {
    res.json(await Cart.find({ userId: req.params.userId }));
  } catch {
    res.status(500).json({ message: "Error fetching cart" });
  }
});

app.put("/cart/:id", async (req, res) => {
  try {
    const { quantity } = req.body;

    const item = await Cart.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = quantity;
    await item.save();

    res.json({ message: "Cart updated", item });

  } catch {
    res.status(500).json({ message: "Error updating cart" });
  }
});

app.delete("/cart/:id", async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed from cart" });
  } catch {
    res.status(500).json({ message: "Error deleting item" });
  }
});

app.post("/createOrder", async (req, res) => {
  try {
    const { paymentMethod, address ,status,userId} = req.body;
    const cartItems = await Cart.find({userId});

    if (cartItems.length === 0)
      return res.status(400)
      .json({ message: "Cart is empty" });

    const totalAmount = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);

    const orderItems = cartItems.map(i => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      image: i.image,
      quantity: i.quantity
    }));

    const newOrder = await new Order({
      userId:req.body.userId,
      items: orderItems,
      totalAmount,
      paymentMethod,
      address,
      status: status|| "Pending",
      changeStatus: "Pending"
    }).save();

    const productList = orderItems.map(i => `${i.name} (x${i.quantity}) - ₹${i.price}`).join("\n");

    try {
      const info = await transporter.sendMail({
        from: '"JioMart" <shtynidhi@gmail.com>',
        to: address.email,
        subject: "Order Confirmation - JioMart",
        text: `Hello ${address.name},

        Your order has been placed successfully!

        ${productList}

        Total: ₹${totalAmount}
        Payment: ${paymentMethod}

        Address:
        ${address.address}, ${address.pincode}`
      });
      console.log("ORDER MAIL SENT:", info.response);
    } catch (err) {
      console.log("ORDER MAIL ERROR:", err);
    }

    await Cart.deleteMany({userId});

    res.json({ message: "Order placed successfully", order: newOrder });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error placing order" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    res.json(await Order.find().sort({ createdAt: -1 }));
  } catch {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

app.put("/order/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.findByIdAndUpdate(req.params.id, req.body);

    if (req.body.changeStatus === "Shipped" || req.body.changeStatus === "Delivered") {
      try {
        const info = await transporter.sendMail({
          from: '"JioMart" <shtynidhi@gmail.com>',
          to: order.address.email,
          subject: `Order ${req.body.changeStatus}`,
          text: `Hello ${order.address.name},

        Your order status has been updated to: ${req.body.changeStatus}`
        });
        console.log("STATUS MAIL SENT:", info.response);
      } catch (err) {
        console.log("STATUS MAIL ERROR:", err);
      }
    }

    res.json({ message: "Order updated successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating order" });
  }
});

app.delete("/order/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch {
    res.status(500).json({ message: "Error deleting order" });
  }
});

app.get("/search", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.json([]);
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/razorpayOrder", async (req, res) => {
  try {
    const { userId } = req.body;
    const cartItems = await Cart.find({ userId });

    if (cartItems.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const totalAmount = cartItems.reduce(
      (t, i) => t + i.price * i.quantity,
      0
    );

    const options = {
      amount: totalAmount * 100, 
      currency: "INR",
      receipt: "order_rcptid_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: totalAmount
    });

  } catch (err) {
    res.status(500).json({ message: "Razorpay error" });
  }
});


app.post("/verifyPayment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod,
      userId,
      address
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {

      const cartItems = await Cart.find({ userId });

      const totalAmount = cartItems.reduce(
        (t, i) => t + i.price * i.quantity,
        0
      );

      const orderItems = cartItems.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        image: i.image,
        quantity: i.quantity
      }));

      const newOrder = await new Order({
        items: orderItems,
        totalAmount,
        paymentMethod,
        address,
        userId,
        status: "Paid",
        changeStatus: "Pending"
      }).save();

      await Cart.deleteMany({ userId });

      return res.json({
        message: "Payment verified & Order placed successfully",
        order: newOrder
      });
    } else {
      return res.status(400).json({
        message: "Payment verification failed"
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Verification error" });
  }
});

app.get("/my-orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

app.get("/getUser/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Error fetching user" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => 
  console.log(`Server running on port ${PORT}`));