//THIS IS THE HOME OF THE BUSINESS LOGIC
//THIS MODULE IS THE MODEL IN THE MODEL CONTROLLER VIEW ARCHITECTURE
import { async } from 'regenerator-runtime';
import { API_URL, KEY, RES_PER_PAGE } from './config';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [], // changed [] to {} made no difference find out why.
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (forkifyAPIdata) {
  const { recipe } = forkifyAPIdata.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const forkifyAPIdata = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(forkifyAPIdata);

    if (state.bookmarks.some(bookmark => bookmark.id === state.recipe.id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(`${err} 🙈`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const searchData = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    state.search.results = searchData.data.recipes.map(function (received) {
      return {
        id: received.id,
        image: received.image_url,
        publisher: received.publisher,
        title: received.title,
        ...(received.key && { key: received.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 🙈👎🍳😡`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  let start = (page - 1) * state.search.resultsPerPage;
  let end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  window.localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === state.recipe.id);
  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();
//this is where clearBookmarks were
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());

        if (ingArr.length !== 3)
          throw new Error('Wrong input format, please use indicated format');

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });
    //POST or PUT RECIPE INFORMATION TO API
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    }; ////////////AJAX that used to be sendJSON has two parameters the URL and the data duh
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

/*
display number of pages in pagination
add ability for user to sort search results by duration or number of ingredients (maybe not available)
perform ingredient on input form live style.
improve input form separate ingredients quantity unit description and allow for unlimited ingredient input

//additional featured
-add shopping list
-weekly meal plan feature
-get nutritional info from https://spoonacular.com/food-api and calculate total calories of recipe.   
*/
