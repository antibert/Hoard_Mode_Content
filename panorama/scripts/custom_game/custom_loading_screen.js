"use strict";

// Tip of the day text is loaded from a different source. See file tip_of_the_day_text.js
//var tipArray = ["", ""];
var currentTip = 0;

function setNewTip(tipNum){
  $( "#Hoard_TipOfTheDay_Text" ).text=tipArray[tipNum];
}

function nextTipOfTheDay() {
  currentTip = currentTip + 1;
  if (currentTip > tipArray.length-1){
      currentTip = 0;
  }
  
  setNewTip(currentTip);
}

function prevTipOfTheDay() {    
  currentTip = currentTip - 1;
  if (currentTip < 0){
      currentTip = tipArray.length-1;
  }
  
  setNewTip(currentTip);
}

// --- Init ---
(function()
{
  currentTip = Math.floor((Math.random()*tipArray.length));
  setNewTip(currentTip);
})();