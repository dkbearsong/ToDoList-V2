//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require ("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

// Schema
const itemsSchema = new mongoose.Schema({
  name: String
});
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

// Models
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

// Variables
const defaultItems = [{
  name: "Welcome to your todolist!"}, {
  name: "Hit the + button to add a new item."}, {
  name: "<-- Hit this to delete an item"}];

app.get("/", function(req, res) {
  Item.find({},
   function(err, foundItems){
     if (foundItems.length === 0) {
       Item.insertMany(defaultList,
       function(err){
         if (err) {
           console.log(err);
         } else {
           console.log("Successfully added to db");
         }
       });
       res.redirect("/");
      } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
   }
 });
});

app.get("/:customListName", function(req,res){
  const customListName = req.params.customListName;
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems});
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      };
    };
  });
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully removed item from db");
    }
  });
  res.redirect("/");
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });
  item.save();
  res.redirect("/")  ;
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
