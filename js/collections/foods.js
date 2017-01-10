var app = app || {};

// Foods Collection
// ---------------
/*
 * List of foods model
 * Use Backbone's localstorage adapter to save last session
 */

var FoodList = Backbone.Collection.extend({

  model: app.Food,
  localStorage: new Backbone.LocalStorage('health-storage')

});

app.Foods = new FoodList();