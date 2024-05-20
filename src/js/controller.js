//THIS MODULE IS THE CONTROLLER IN THE MODEL VIEW CONTROLLER ARCHITECTURE
//THE CONTROLLER IS THE GO BETWEEN FOR THE MODEL AND THE VIEW
//THIS IS THE HOME OF THE APPLICATION LOGIC

import * as model from './model.js';
import recipeView from './views/recipeViews.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipesView from './views/addRecipesView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime'; //comment this out and see if all still works

if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage()); //0)Update / render results view to mark selected search results

    bookmarksView.update(model.state.bookmarks); //1)Updating bookmarks view

    await model.loadRecipe(id); // 2) LOAD RECIPE FROM MODEL MODULE
    const { recipe } = model.state;

    recipeView.render(model.state.recipe); // 3) RENDER RECIPE INFORMATION TO PAGE
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery(); // 1) Get search query
    if (!query) return;

    await model.loadSearchResults(query); //2) Load search results

    resultsView.render(model.getSearchResultsPage()); //3) Render results

    paginationView.render(model.state.search); //4) Render pagination buttons
  } catch (err) {
    console.log(err);
  }
};

//Subscriber of the publisher subscriber pattern
const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage)); //1) Render new results

  paginationView.render(model.state.search); //2) Render new pagination buttons
};

const controlServings = function (newServings) {
  model.updateServings(newServings);

  recipeView.update(model.state.recipe);
};

controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked)
    //1) Add remove bookmarks on recipe object in state object
    model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe); //2) Update the recipe view the little flag thingy.

  bookmarksView.render(model.state.bookmarks); //3) Render bookmarks
};

controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipesView.renderSpinner();

    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);

    addRecipesView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function () {
      addRecipesView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💩', err);
    addRecipesView.renderError(err.message);
  }
};

const init = function () {
  //THE SUBSCRIBER IS THE INTERLINK TO THE PUBLISHER THROUGH CALLING THE FUNCTION FROM THE PUBLISHER IN THE SUBSCRIBER THIS IS POSSIBLE BECAUSE THE PUBLISHED HAS BEEN EXPORTED TO THE SUBSCRIBER.
  //Jaco make this very important distinction controlRecipes is a function that is being passed in as an argument for the function addHandlerRender in the recipeViews file. The addHandlerRender function only contains the addEventListener function to listen for events
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipesView.addHandlerUpload(controlAddRecipe);
};
init();
