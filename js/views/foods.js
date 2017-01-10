var app = app || {};

// Food Item View
// --------------
/*
 * Views for individual Food items
 * These are displayed in the 'Your items' section
 */

app.FoodView = Backbone.View.extend({

  tagName: 'li',

  //for displaying individual food items and their properties
  template: _.template($('#item-template').html()),

  //when you click on the delete button on a food item
  events: {
    'click .delete': 'clear',
  },

  initialize: function() {
    this.listenTo(this.model, 'destroy', this.remove);
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },

  clear: function() {
    this.model.destroy();
  }

});