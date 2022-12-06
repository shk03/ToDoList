//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require('lodash');


mongoose.connect("mongodb+srv://admin-shkim:XGMXJuKwi8CZ5E6E@cluster0.jymmoou.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Mongoose Schema
const itemSchema = new mongoose.Schema({
  name: String
});

// Mongoose Model
const Item = mongoose.model("Item", itemSchema);

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

const defaultItems = [item1, item2, item3];

// Custom Schema

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

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

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: customListName, newListItems: foundList.items});
      }
    } 
  })
  
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = _.capitalize(req.body.list);

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listItem = _.capitalize(req.body.listName);

  if (listItem === "Today") {
    Item.findOneAndRemove({_id: checkedItemId}, function(err) {
      if (!err) {
        console.log("Item successfully removed from DB.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listItem}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listItem);
      }
    });
  }
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

