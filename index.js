require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");



const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));
app.use(bodyParser.json());


mongoose.connect(process.env.MONGO_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

const portfolioSchema = mongoose.Schema({
  name: "String",
  technology: "String",
  description: "String",
  img:{
    data: Buffer,
    ontentType: String
  },
  link:"String"
});

var fs = require('fs');
var path = require('path');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });


const Portfolio = new mongoose.model("Portfolio", portfolioSchema);



app.get('/', (req, res) => {
    Portfolio.find({}, (err, items) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render("index", { items: items });
        }
    });
});


app.get(`/${process.env.CREATE_URL}`, (req, res)=>{
    res.render("createPortfolio");
});


app.post(`/${process.env.CREATE_URL}`, upload.single('image'), (req, res, next) => {
  var obj = {
    name: req.body.name,
    technology : req.body.technology,
    description : req.body.description,
    link : req.body.link,
    img: {
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      contentType: 'image/png'
    }
  }
  Portfolio.create(obj, (err, item) => {
      if (err) {
          console.log(err);
      }
      else {
          // item.save();
          res.redirect('/');
      }
  });
});

app.listen(process.env.PORT || 3000, ()=>{
  console.log("Server Started at port 3000");
});
