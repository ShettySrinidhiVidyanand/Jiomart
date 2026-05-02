const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const app = express();
const GST_PERCENT = 18;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URL,) 
.then(() => console.log("MongoDB Atlas Connected")) 
.catch((err) => console.log(err));

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   family: 4,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.log("EMAIL ERROR:", err);
  } else {
    console.log("EMAIL WORKING");
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
  image: String,
  gst: Number
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
  quantity: Number,

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
  subtotal: Number,
  gstAmount: Number,
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

const generateInvoice = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#cc4f33") 
      .text("JioMart", 40, 30);

    doc.fillColor("black");
    doc.moveDown(1); 
    doc.fontSize(18).text("OFFICIAL RECEIPT", { align: "center" });

    doc.fontSize(10);
    doc.text(`Invoice #: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Payment: ${order.paymentMethod}`);
    doc.moveDown();

    const leftX = 40;
    const rightX = 300;
    let y = doc.y;

    doc.text("Billed To:", leftX, y);
    doc.text("Shipping:", rightX, y);

    y += 15;
    doc.text(order.address.name, leftX, y);
    doc.text("Standard Delivery", rightX, y);

    y += 15;
    doc.text(order.address.address, leftX, y);
    doc.text("3-5 Days", rightX, y);

    y += 30;

    const col = {
      item: 40,
      qty: 220,
      price: 270,
      base: 330,
      cgst: 390,
      sgst: 440,
      total: 490
    };

    doc.font("Helvetica-Bold");
    doc.text("Item", col.item, y);
    doc.text("Qty", col.qty, y);
    doc.text("Price", col.price, y);
    doc.text("Base", col.base, y);
    doc.text("CGST", col.cgst, y);
    doc.text("SGST", col.sgst, y);
    doc.text("Total", col.total, y);

    y += 10;
    doc.moveTo(40, y).lineTo(550, y).stroke();

    doc.font("Helvetica");

    let subtotal = 0;
    let gstTotal = 0;

    order.items.forEach(item => {
      y += 15;

      const price = item.price;
      const qty = item.quantity;
      const gst = item.gst || GST_PERCENT;

      const base = price / (1 + gst / 100);
      const taxable = base * qty;

      const cgst = (taxable * gst) / 200;
      const sgst = cgst;

      const total = price * qty;

      subtotal += taxable;
      gstTotal += cgst + sgst;

      doc.text(item.name, col.item, y, { width: 170 });
      doc.text(qty.toString(), col.qty, y);
      doc.text(price.toFixed(2), col.price, y);
      doc.text(taxable.toFixed(2), col.base, y);
      doc.text(cgst.toFixed(2), col.cgst, y);
      doc.text(sgst.toFixed(2), col.sgst, y);
      doc.text(total.toFixed(2), col.total, y);
    });

    y += 20;
    doc.moveTo(40, y).lineTo(550, y).stroke();


    y += 15;
    const summaryX = 380;

    doc.text(`Base Subtotal: ₹${subtotal.toFixed(2)}`, summaryX, y);
    y += 15;
    doc.text(`Total Tax (GST): ₹${gstTotal.toFixed(2)}`, summaryX, y);
    y += 15;
    doc.text(`Shipping: FREE`, summaryX, y);

    y += 20;
    doc.font("Helvetica-Bold");
    doc.text(`Grand Total: ₹${(subtotal + gstTotal).toFixed(2)}`, summaryX, y);

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};
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
  console.log("LOGIN REQ:");
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "JioMart Login OTP",
        text: `Your OTP is ${otp}`
      });
    } catch (mailErr) {
      console.log("EMAIL ERROR:", mailErr);

      return res.json({
        message: "Email failed. Try again later"
      });
    }

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
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

    if (!req.file) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    const product = await Product.create({
      name: req.body.name,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      description: req.body.description,
      category: req.body.category,
      image: req.file.path, 
      gst: Number(req.body.gst)
    });

    res.json({ message: "Product Added Successfully", product });

  } catch (err) {
    console.log("FULL ERROR:", err); 
    res.status(500).json({ error: err.message });
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
      description: req.body.description,
      gst: req.body.gst
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
    console.log("ADD TO CART BODY:", req.body);
    const { productId, name, price, image, quantity,userId } = req.body;

    const existingItem = await Cart.findOne({ productId ,userId});

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      await existingItem.save();
    } else {
      await new Cart({ productId, name, price: Number(price), image, quantity: Number(quantity), userId }).save();
    }

    res.json({ message: "Product added to cart" });

  } catch (err) {
    console.log("ADD TO CART ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/cart/:userId", async (req, res) => {
  try {
    res.json(await Cart.find({ userId: req.params.userId }));
  } catch (err) {
    res.status(500).json({ message: err.message });
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

  } catch (err) {

    res.status(500).json({ message: err.message });
  }
});

app.delete("/cart/:id", async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item" });
  }
});

// const sendInvoice = async (order) => {
//   const filePath = `invoice-${order._id}.pdf`;

//   await generateInvoice(order, filePath);

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: order.address.email,
//     subject: "Invoice",
//     text: "Your invoice attached",
//     attachments: [{ path: filePath }]
//   });

//   fs.unlinkSync(filePath); // delete file
// };

const sendInvoice = async (order) => {
  try {
    const filePath = `invoice-${order._id}.pdf`;

    await generateInvoice(order, filePath);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: order.address.email,
      subject: "Invoice",
      text: "Your invoice attached",
      attachments: [{ path: filePath }],
    });

    fs.unlinkSync(filePath);

  } catch (err) {
    console.log("INVOICE EMAIL FAILED:", err);
  }
};

app.post("/createOrder", async (req, res) => {
  try {
    const { userId, address, paymentMethod } = req.body;

    const cart = await Cart.find({ userId });

    let subtotal = 0;
    let gstAmount = 0;

    const items = cart.map(i => {
      const gst = i.gst || GST_PERCENT;
      const base = i.price / (1 + gst / 100);
      const taxable = base * i.quantity;
      const tax=(taxable * gst) / 100;

      subtotal += taxable;
      gstAmount += tax;

      return {
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image

      };
    });

    const order = await Order.create({
      userId,
      items,
      subtotal,
      gstAmount,
      totalAmount: subtotal + gstAmount,
      paymentMethod,
      address,
      status: "Pending"
    });

    await sendInvoice(order);
    await Cart.deleteMany({ userId });

    res.json({
      message: "Order created successfully",
      order
    });

  } catch (err) {
    res.status(500).json(err);
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

    if (
      req.body.changeStatus === "Shipped" ||
      req.body.changeStatus === "Delivered"
    ) {
      try {
        const info = await transporter.sendMail({
          from: `"JioMart" <${process.env.EMAIL_USER}>`,
          to: order.address.email,
          subject: "Order Status Update",
          text: `Hello ${order.address.name},

Your order is now ${req.body.changeStatus}.

Total: ₹${order.totalAmount}`
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

        const subtotal = cartItems.reduce(
      (t, i) => t + i.price * i.quantity,
      0
    );

    const gstAmount = (subtotal * GST_PERCENT) / 100;
    const totalAmount = subtotal + gstAmount;

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, address,paymentMethod } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: "Invalid payment" });

    const cart = await Cart.find({ userId });

    let subtotal = 0;
    let gstAmount = 0;

    const items = cart.map(i => {
      const gst = i.gst || GST_PERCENT;
      const base = i.price / (1 + gst / 100);
      const taxable = base * i.quantity;
      const tax=(taxable * gst) / 100;

      subtotal += taxable;
      gstAmount += tax;

      return {
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        gst: gst,
        image: i.image

      };
    });

    const order = await Order.create({
      userId,
      items,
      subtotal,
      gstAmount,
      totalAmount: subtotal + gstAmount,
      paymentMethod: paymentMethod||"Paid",
      address,
      status: "Paid"
    });

    await sendInvoice(order);
    await Cart.deleteMany({ userId });

    res.json(order);

  } catch (err) {
    res.status(500).json(err);
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

app.get("/admin-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find();

    let totalRevenue = 0;
    let paidPayments = 0;

    let pending = 0;  
    let shipped = 0;
    let delivered = 0;

    orders.forEach((item) => {
      totalRevenue += item.totalAmount || 0;

      if (item.status === "Paid") {
        paidPayments++;
      }

      if (item.status === "Pending") pending++;
      if (item.status === "Shipped") shipped++;
      if (item.status === "Delivered") delivered++;
    });

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      paidPayments,
      pending,
      shipped,
      delivered,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => 
  console.log(`Server running on port ${PORT}`));