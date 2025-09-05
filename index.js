const express = require('express');
const app = express();
const PORT=process.env.PORT || 8080;                       
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Product = require('./models/product');
const expressLayouts = require('express-ejs-layouts');
require("dotenv").config();
app.use(expressLayouts);



mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' Connection error:', err));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


const categories = ['fruit', 'vegetable', 'dairy'];

app.get('/',async(req,res)=>{
  try{
    res.redirect('products')
  }catch(e){
    console.log(e);
  }
})

app.get('/products', async (req, res) => {
  const { category } = req.query;
  let products;
  if (category) {
    products = await Product.find({ category });
    res.render('products/index', { products, category, title: `${category} Products` });
  } else {
    products = await Product.find({});
    res.render('products/index', { products, category: 'All', title: 'All Products' });
  }
});


app.get('/products/new', (req, res) => {
  res.render('products/new', { categories });
});

app.post('/products', async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.redirect(`/products/${newProduct._id}`);
});


app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return res.status(404).send('Product not found');
  res.render('products/show', { product });
});


app.get('/products/:id/edit', async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return res.status(404).send('Product not found');
  res.render('products/edit', { product, categories });
});


app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
  res.redirect(`/products/${product._id}`);
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.redirect('/products');
});

app.listen(PORT, () => {
  console.log(" Server running on http://localhost:8080 connection successed");
});
