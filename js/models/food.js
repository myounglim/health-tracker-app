var app = app || {};

// Food Model
// ----------
/*
 * Each model stores the fields of title, calories, and servings
 */

app.Food = Backbone.Model.extend({

  defaults: {
    title: '',
    calories: 100,
    servings: 0
  }

});