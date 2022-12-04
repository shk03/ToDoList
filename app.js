//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
});

// Mongoose Schema
const itemSchema = new mongoose.Schema({
  name: String
});
const workItemSchema = new mongoose.Schema({
  name: String
})

// Mongoose Model
const Item = mongoose.model("Item", itemSchema);
const WorkItem = mongoose.model("WorkItem", workItemSchema);

// Mongose Documents
const item1 = new Item({
  name: "Work out"
});

const item2 = new Item({
  name: "Buy groceries"
});

const item3 = new Item({
  name: "Tidy up"
});

const workItem1 = new WorkItem({
  name: "Check Emails"
})

const defaultItems = [item1, item2, item3];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      // Save Default Items
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    }
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  });
});


app.post("/", function (req, res) {
  const itemName = req.body.newItem;

  const itemX = new Item({
    name: itemName,
  });

  itemX.save();
  res.redirect("/");
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  console.log(req.body);
  Item.findOneAndRemove({_id: checkedItemId}, function(err) {
    console.log("Item successfully removed from DB.");
  });
  res.redirect("/");
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: foundWorkItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
