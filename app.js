//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Sadat:Test191@cluster0.yg7ipsx.mongodb.net/todolistDB");

const itemSchema = {
  name: String
};


const Item = mongoose.model("item", itemSchema);

const item1 = new Item({
  name: "Welcome to Your TODO list"
});
const item2 = new Item({
  name: "Hit the + button to add item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  list: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Items inserted successfully!");
        }

      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.get("/:choice", (req, res) => {
  const customList = _.capitalize(req.params.choice);

  List.findOne({
    name: customList
  }, (err, foundlist) => {
    if (!err) {
      if (!foundlist) {
        const newList = new List({
          name: customList,
          list: defaultItems
        });

        newList.save();
        res.redirect("/" + customList);
      } else {
        res.render("list",{listTitle: foundlist.name, newListItems: foundlist.list});
      }
    }
  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItemName = new Item({
    name: itemName
  });

if(listName === "Today"){
  newItemName.save();
  res.redirect("/");
}else {
  List.findOne({name: listName},(err,foundedList)=>{
    foundedList.list.push(newItemName);
    foundedList.save();
    res.redirect("/" + listName);
  });
}
});

app.post("/delete", (req, res) => {
  const checkedItemID = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id: checkedItemID}, (err) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        console.log("Checked Item delete successfully!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull:{list:{_id:checkedItemID}}},(err,foundItems)=>{
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }


});

let port = process.env.PORT;
if (port == null || port ==""){
  port =3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
