//new_item...name given to the new input in form (its NOT an array)
//item...it gets its value from new_item using req.body.new_item & its an array
//new_list....array of all items entered in the list
//all_items...new_list array is passed into this array by res.render & item is pushed into it using .push function

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js"); //requiring this is a bit DIFFERENT from other modules ;since it is a local module we have created
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs'); //must be BELOW the  const app = express(); line
app.use(bodyParser.urlencoded({extended: true})); //must be BELOW the  const app = express(); line
app.use(express.static("public")); // to use serve files  // folder name to store these static files is public
mongoose.connect('mongodb+srv://demo:vedant123@cluster0.smy48.mongodb.net/toDoDB', {useNewUrlParser: true }); //name of database id toDoDB

// the array below was used when i did without mongoose...to store tasks in an array
// let all_items=[]; //length increases after a new element is added//created an array for all the items we typed in the form




let toDoSchema = new mongoose.Schema({ //model of toDoDB database
  task: String
});

let Kaam = mongoose.model("Kaam", toDoSchema); //Kaam(capital k) is a model //kaam(small k) is an element in our toDoDB which follows the toDoSchema
//now we are ready to add elements to toDoDB  //Kaam is converted to kaams using LODASH and adding a S at the end of string....done internlly by node modules...so at end we see kaams as the collection inside our database


let ek = new Kaam({ //added default item in Kaam collection
  task: "Welcome to your ToDo List!"
});
let doo = new Kaam({ //added defaylt item in Kaam collection
  task: "Hit + to add an item."
});
let teen = new Kaam({ //added default item in Kaam collection
  task: "<-- Hit to delete an item."
});

const defaultTask = [ek, doo, teen]; //creating array defaultTask to insertMany items at one go




// const personalizedSchema = new mongoose.Schema({  //schema for the DYNAMIC url (params wala)
//   name: String,
//   personalizedTask : [toDoSchema] //using the above mentioned toDoSchema for putting the defaultTask in the model
// });

const personalizedSchema = {  //schema for the DYNAMIC url (params wala)
  name: String,
  personalizedTask : [toDoSchema] //using the above mentioned toDoSchema for putting the defaultTask in the model
};

let PersonalKaam = mongoose.model("PersonalKaam",personalizedSchema); //model for personalizedSchema //model name is PersonalKaam




app.get("/", function(req, res) { //ON LOADING HOMEPAGE, THIS BLOCK OF CODE WORKS...since ROOT ROUTE

  let day = date.getDate(); //VVIMP*** we have written date.getDate() and NOT date.getDate ....because parenthesis means we are callingthe function(in date.js file) NOW*****
  //rendering js object as key:value pair

  Kaam.find({}, function(err, foundItems) { //.find to pass all(since we have used {}...empty curly brackets) tasks to the callback function  // .find returns an array

    if (foundItems.length === 0) { //so that defaultTask is not added multiple times

      Kaam.insertMany(defaultTask, function(err) { //insert many........to insert the defaultTask
        if (err) {
          console.log(err);
        } else {
          console.log("default added successfully");
        }
      });

      res.redirect("/"); //after we added defaultTask, then IF statement is completed BUT WE COULDN'T RENDER to lists, thus...we redirect it to root route, where we now fall in ELSE statement and we will render now.
    } else {
      res.render('list', {kindOfDay: day,new_list: foundItems}); //creating a response by rendering a file called LIST (with .ejs extension) in VIEWS folder, and passing variables called 'kindOfDay' and 'new_list' which have value = value of day variable and foundItems array respectively.
      //'list' because it at the same hierarchial lvl as the app.js INSIDE the views folder; ie. agar views ke andar ek aur folder hota jiske andar 'list' file hoti; then we eould do 'folder_name/list'********   //so kindOfDay is in this format: Saturday,September 17
    }
  });
});




app.get("/:personalizedListName",function(req,res){  //for dynamic url
  let personalizedTitle = _.capitalize(req.params.personalizedListName);  // params is used for dynamic url  //personalizedTitle stores the personalizedListName name //lodash capitalize is used to make 1st letter capital and rest all small.....this is done so that Home,HOME,hoME,etc all end up being same in the code below (where we used findOne)

  PersonalKaam.findOne({name:personalizedTitle},function(err, foundSameTitle){  //.findOne returns an object called foundSameTitle ONLY when the name (of any entry in PersonalKaam) matches with personalizedTitle
    if(!err){  //if no error

      if(!foundSameTitle){   //if there is no entry with the name personalizedTitle, then we will add a new list, otherwise no need to add list with same name again and again
        const lol = new PersonalKaam({  //creating a new entry lol which follows our model
          name:personalizedTitle,
          personalizedTask:defaultTask
        });
        lol.save(); //saving each entry
        res.redirect("/"+personalizedTitle);  //redirecting to the route we want to go to personally //because after lol.save(), website halts....thinks what next?....so we redirect it

      }
      else{  // if personalizedTitle (entry in our model) matches with foundSameTitle , then just render the list template
        res.render('list', {kindOfDay: foundSameTitle.name,new_list: foundSameTitle.personalizedTask});
      }
  }

});
});




app.post("/", function(req, res) { //ON PRESSING SUBMIT BUTTON, THIS BLOCK OF CODE WORKS
  let newAddedTask = req.body.new_item; //storing the newly entered element ki VALUE (with NAME new_item in the list.ejs file)
  let nameFromButton = req.body.buttonName; //to get the VALUE(kindOfDay) of the button
  let day = date.getDate();  //again to get the day

  let taskVariable = new Kaam({ //addig the newAddedTask task to Kaam model (for the dynamic url)
    task: newAddedTask  //storing the new entered element ki VALUE
  });

  if(nameFromButton === day){ // if we are in the main page
    taskVariable.save(); // newAddedTask is saved in taskVariable, and taskVariable is saved in the database
    res.redirect("/"); //redirect to root route after adding item to array, ie redirected to the code above ie.(app.get)
  }else{// if we are in some dynamic url page
    PersonalKaam.findOne({name:nameFromButton},function(err, foundSameTitle){ //we have created a different database for each dynamic nameFromButton....foundSameTitle is the database...if the name matches with any of the names in the foundSameTitle, then we add the task to it....thus creating a dynamic database for each nameFromButton
      foundSameTitle.personalizedTask.push(taskVariable); //pushing the personalizedTask in dynamic database
      foundSameTitle.save(); //saving each entry
      res.redirect("/"+nameFromButton);  //redirect to the same directory....because after foundSameTitle.save()...the web page halts....so we redirect it.
    })
  }

});



app.post("/delete", function(req, res) { //delete route....its a route and NOT ANY SEPARATE WEB PAGE.....REMOVE CONFUSION

  const checkedItemId = req.body.checkbox_name;//to access the chekcbox wala item whose value ="item._id"....we had set it there
  const hiddenName = req.body.hiddenName;// to access the VALUE with hiddenName
  let day = date.getDate();  //again to get the day

  if(hiddenName===day){
    Kaam.findByIdAndRemove(checkedItemId , function(err){ //to delete elements using id
      if (!err) {
        console.log("deleted successfully");
        res.redirect("/");//redirect to root to reflect the changes on the page
      }
    });
  }else{
    PersonalKaam.findOneAndUpdate({name: hiddenName}, {$pull: {personalizedTask: {_id: checkedItemId}}}, function(err, foundSameTitle){  //findOneAndUpdate syntax: ({filter},{update},{options})....here in update part we have used $pull ///used to remove items....{$pull:{_id: checkedItemId}}} THIS WOULD BE WRONG since personalizedTask ko remove karna hai (using _id)
      if (!err){
        res.redirect("/" + hiddenName);//redirect to customized url
      }
    });
  }

});




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() { //3000 for local host and process.env.PORT for heroku
  console.log("server started");
});
