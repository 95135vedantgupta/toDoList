//this is a MODULE we have created ourselves to make app.js less complex in the app.get part.
//we are finding day/date here and returning it to app.js

//NOT getDate()....NO PARENTHESIS...parenthesis is used when we wanna call functions....here we are NOT calling it.....we are just assigning....we have called it in app.js (there we have used let day = date.getDate().....parenthesis used)
//export..WRONG.....exports...right
exports.getDate = function(){
  //this part of code was in app.get(); but we used it here to simplify the code there
  let today = new Date(); //tells current day ,date,time
  let options = {    //from here till 'var day' is from stack over folw
     weekday: 'long',
     month: 'long',
     day: 'numeric'
   };
  return today.toLocaleDateString("en-US",options); //returns string in this format: Saturday,September 17
}
