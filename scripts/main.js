
/* 
This website was adapted from the Firebase Database web quickstart 
found at https://github.com/firebase/quickstart-js/tree/master/database 
*/

/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';


// Shortcuts to DOM Elements.
var messageForm = document.getElementById('item-form');
var descriptionInput = document.getElementById('new-item-description');
var nameInput = document.getElementById('new-item-name');
var priceInput = document.getElementById('new-item-price');
var typeInput = document.getElementById('new-item-type');
var allergiesInput = document.getElementById('new-item-allergies');
var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var splashPage = document.getElementById('page-splash');
var addPost = document.getElementById('add-post');
var addButton = document.getElementById('add');
var userItemsSection = document.getElementById('user-posts-list');
var myItemsMenuButton = document.getElementById('menu-my-posts');
var listeningFirebaseRefs = [];

var deleteButton = document.getElementsByClassName('delete-button');

var storageRef = firebase.storage().ref();

document.querySelector('.file-select').addEventListener('change', handleFileUploadChange);
document.querySelector('.file-submit').addEventListener('click', handleFileUploadSubmit);

let selectedFile;
/**
 * Saves a new post to the Firebase DB.
 * writeNewMenuItem(firebase.auth().currentUser.uid, *firebase.auth().currentUser.photoURL,* name, price, type, allergies, description);
 */
// [START write_fan_out]
function writeNewMenuItem(uid, name, price, type, allergies, description, url) {
  // A post entry.
  var itemData = {
    name: name,
    description: description,
    price: price,
    /*itemPicture: picture,*/
    itemType: type,
    itemAllergies: allergies,
    imageUrl: url
  };

  // Get a key for a new Item.
  var newItemKey = firebase.database().ref().child('items').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  // updates['/posts/' + newItemKey] = itemData;
  updates['/user-items/' + uid + '/' + newItemKey] = itemData;

  return firebase.database().ref().update(updates);
}

/**
 * Creates a post element.
 */

 /*  -------------------------------------------------------------------- ITEM CREATION ---------------------------------------------------------------- */
function createItemElement(itemId, name, price, type, allergies, description, dataImage) {
  var uid = firebase.auth().currentUser.uid;

  var html =
      '<div class="item item-' + itemId + ' mdl-cell mdl-cell--12-col ' +
                  'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing"' +
                ' data-id="' + itemId + '">' +
        '<div class="mdl-card mdl-shadow--2dp">' +
          '<div class="mdl-card__title mdl-color-text--white main-color">' +
            '<h4 class="mdl-card__title-text name-text"></h4>' +
          '</div>' +
          '<div class="header">' +
          '</div>' +
          '<span class="star">' +
            '<button class="mdl-button delete-button" onClick = "onDelete(this)"><div>Delete</div></button>' +
          '</span>' +
          '<img class="imageUrl imageSize">' +
          '<div class="price item text">Price: $</div>' +
          '<div class="type item text">Type: </div>' +
          '<div class="allergies item text">Allergies: </div>' +
          '<div class="description item text">Description: </div>' +
        '</div>' +
      '</div>';

  // Create the DOM element from the HTML.
  var div = document.createElement('div');
  div.innerHTML = html;
  var itemElement = div.firstChild;
  // console.log(div.firstChild)
  // console.log(itemElement.getElementsByClassName('item')[0])
  // if (componentHandler) {
  //   componentHandler.upgradeElements(itemElement.getElementsByClassName('item-' + itemId)[0]);
  // }

  // Set values.
  itemElement.getElementsByClassName('price')[0].innerText += price;
  itemElement.getElementsByClassName('type')[0].innerText += type;
  itemElement.getElementsByClassName('allergies')[0].innerText += allergies;
  itemElement.getElementsByClassName('description')[0].innerText += description;
  itemElement.getElementsByClassName('mdl-card__title-text')[0].innerText = name;
  storageRef.child(dataImage).getDownloadURL().then(function(url){
                       itemElement.getElementsByClassName('imageUrl')[0].src = url;
                                                    }).catch(function(error) {
                                                             console.log("It sure did error, you bet your sweet bippy");
                                                             });
  

  return itemElement;
}

/**
 * Starts listening for new posts and populates posts lists.
 */
function startDatabaseQueries() {
  var myUserId = firebase.auth().currentUser.uid;
  var userItems = firebase.database().ref('user-items/' + myUserId).orderByChild('type');

  var fetchItems = function(itemsRef, sectionElement) {
    itemsRef.on('child_added', function(data) {
      var containerElement = sectionElement.getElementsByClassName('items-container')[0];
      /*console.log(data.key);
      console.log(data.val().name);
      console.log(data.val().price);
      console.log(data.val().itemType);
      console.log(data.val().itemAllergies);
      console.log(data.val().description);
      console.log(data.val().imageUrl);*/
      containerElement.insertBefore(
        createItemElement(data.key, data.val().name, data.val().price, data.val().itemType, data.val().itemAllergies, data.val().description, data.val().imageUrl),
        containerElement.firstChild);
    });
    itemsRef.on('child_changed', function(data) {
      var containerElement = sectionElement.getElementsByClassName('items-container')[0];
      var itemElement = containerElement.getElementsByClassName('item-' + data.key)[0];
      itemElement.getElementsByClassName('price')[0].innerText = price;
      itemElement.getElementsByClassName('type')[0].innerText = type;
      itemElement.getElementsByClassName('allergies')[0].innerText = allergies;
      itemElement.getElementsByClassName('description')[0].innerText = description;
      itemElement.getElementsByClassName('mdl-card__title-text')[0].innerText = name;
    });
    itemsRef.on('child_removed', function(data) {
      var containerElement = sectionElement.getElementsByClassName('items-container')[0];
      var item = containerElement.getElementsByClassName('item-' + data.key)[0];
      item.parentElement.removeChild(post);
    });
  };

  // // Fetching and displaying all posts of each sections.
  fetchItems(userItems, userItemsSection);

  // // Keep track of all Firebase refs we are listening to.
  listeningFirebaseRefs.push(userItems);
}

/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
  // Remove all previously displayed posts.
  userItemsSection.getElementsByClassName('items-container')[0].innerHTML = '';

  // Stop all currently listening Firebase listeners.
  listeningFirebaseRefs.forEach(function(ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}

/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
var currentUID;

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && currentUID === user.uid) {
    return;
  }

  cleanupUi();
  if (user) {
    currentUID = user.uid;
    splashPage.style.display = 'none';
    //(user.uid, user.displayName, user.email, user.photoURL);
    startDatabaseQueries();
  } else {
    // Set currentUID to null.
    currentUID = null;
    // Display the splash page where you can sign-in.
    splashPage.style.display = '';
  }
}

/**
 * Creates a new post for the current user.
 * newMenuItem(name, price, type, allergies, description)
 */
function newMenuItem(name, price, type, allergies, description, url) {
  // [START single_value_read]
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
    // [START_EXCLUDE]
    return writeNewMenuItem(firebase.auth().currentUser.uid,
      /*firebase.auth().currentUser.photoURL,*/
      name, price, type, allergies, description, url);
    // [END_EXCLUDE]
  });
  // [END single_value_read]
}

/**
 * Displays the given section element and changes styling of the given button.
 */
function showSection(sectionElement, buttonElement) {
  userItemsSection.style.display = 'none';
  addPost.style.display = 'none';
  myItemsMenuButton.classList.remove('is-active');

  if (sectionElement) {
    sectionElement.style.display = 'block';
  }
  if (buttonElement) {
    buttonElement.classList.add('is-active');
  }
}

// Bindings on load.
window.addEventListener('load', function() {
  // Bind Sign in button.
  signInButton.addEventListener('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  });

  // Bind Sign out button.
  signOutButton.addEventListener('click', function() {
    firebase.auth().signOut();
  });

  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

  //Saves message on form submit.
  messageForm.onsubmit = function(e) {
    var uid = firebase.auth().currentUser.uid;
    e.preventDefault();
    var description = descriptionInput.value;
    var name = nameInput.value;
    var price = priceInput.value;
    var type = typeInput.value;
    var allergies = allergiesInput.value;
    // Need to implement different way of storing images
    var url = `images/${uid}/${selectedFile.name}`;
    //add image var
    if (description && name && price && type && allergies && url) {
      newMenuItem(name, price, type, allergies, description, url).then(function() {
        setTimeout(myItemsMenuButton.click(), 1000)
      });
      descriptionInput.value = '';
      nameInput.value = '';
      priceInput.value = '';
      typeInput.value = '';
      allergiesInput.value = '';
      selectedFile = null
    }
  };

  myItemsMenuButton.onclick = function() {
    showSection(userItemsSection, myItemsMenuButton);
  };

  addButton.onclick = function() {
    showSection(addPost);
    descriptionInput.value = '';
    nameInput.value = '';
    priceInput.value = '';
    typeInput.value = '';
    allergiesInput.value = '';
    selectedFile = null
  };
  myItemsMenuButton.onclick(); 
}, false);


function handleFileUploadChange(e) {
    selectedFile = e.target.files[0];
}

function handleFileUploadSubmit(e) {
  var uid = firebase.auth().currentUser.uid;
    const uploadTask = storageRef.child(`images/${uid}/${selectedFile.name}`).put(selectedFile); //create a child directory called images, and place the file inside this directory
    uploadTask.on('state_changed', (snapshot) => {
                  // Observe state change events such as progress, pause, and resume
                  }, (error) => {
                  // Handle unsuccessful uploads
                  console.log(error);
                  }, () => {
                  // Do something once upload is complete
                  console.log('success');
                  });
}
function onDelete(button) {

  var myUserId = firebase.auth().currentUser.uid;
  let item = button.parentElement.parentElement.parentElement;
  let itemId = item.getAttribute('data-id');
  //console.log(itemId);
  //var userItems = firebase.database().ref('user-items/' + myUserId).orderByChild('name');
  firebase.database().ref('user-items/' + myUserId + '/' + itemId).remove(function(error){
    console.log("Bippy boy it didnt delete");
    });
    setTimeout(location.reload(), 1000);
}
