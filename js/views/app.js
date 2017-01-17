var app = app || {};

// The App
// ---------------
/*
 * Central logic for the app
 * Handles user searches and displaying search results as well as displaying calorie totals
 */

app.AppView = Backbone.View.extend({

    el: '.healthapp',

    // for displaying search results from searches
    searchTemplate: _.template($('#search-template').html()),

    events: {
        'keyup .item-search': 'searchEntries',  //when user starts entering a search
        'click .add-button': 'addItem',         //when user clicks on the 'add' button
        'click .search-result': 'clickedResult' //when user clicks on one of the search results
    },

    initialize: function() {
        this.$input = this.$('.item-search');               //search box
        this.$searchList = this.$('.search-list');          //search results
        this.$calories = this.$('.calorie-count');          //calories for the item
        this.$servings = this.$('.serving-size');           //serving size input by user
        this.$totalCalories = this.$('.total-calories');    //total calories text
        this.$itemList = this.$('.item-list');              //list of all the added food items
        this.$itemContainer = this.$('.items-container');   //container for the display of the food items

        this.searchArr = []; //for storing nutrionix api call result

        this.listenTo(app.Foods, 'add', this.addFoodView);  //add each individual food view to DOM
        this.listenTo(app.Foods, 'add', this.render);       //recalculate and redisplay total calories
        this.listenTo(app.Foods, 'remove', this.render);    //recalculate and redisplay total calories

        this.containerRect = $('.items-container')[0].getBoundingClientRect();

        app.Foods.fetch(); //fetch from local storage

        _.bindAll(this, 'render', 'addFoodView', 'searchEntries', 'addItem', 'clickedResult', 'displayMessage');


        //for display to user when they click on 'add' before searching/choosing a serving size
        $('.add-button').tooltip({
            placement: 'right',
            title: 'fill out all fields',
            trigger: 'manual'
        });
    },

    /*
     * Display calorie totals for all items after calculation
     */
    render: function() {
        var calorieTotal = this.getTotal(app.Foods);

        // Update the total calories
        this.$totalCalories.text(calorieTotal + ' calories');

        // calculate the height of the container div each time a new item is added
        var rect = $('.item-calorie').last()[0].getBoundingClientRect();
        this.$itemContainer.height(rect.bottom - this.containerRect.top + 20);
        return this;
    },

    /*
     * Create a new foodview and append to the item-list section
     * The item container is increased in height each time you append the view
     */
    addFoodView: function(food) {
        var view = new app.FoodView({
            model: food
        });
        this.$itemList.append(view.render().el);
    },

    /*
     * AJAX call to Nutrionix API and appending the results to the search-list
     * Additionally, store the results to the searchArr
     */
    searchEntries: function(event) {
        var self = this;
        self.searchArr = [];
        var input = this.$input.val().trim();

        if (input) {
            self.$searchList.html('');
            self.displayMessage('Loading...');
            $.ajax({
                    url: "https://api.nutritionix.com/v1_1/search/" +
                        input + "?results=0%3A10&fields=item_name%2Cbrand_name%2Cnf_calories" +
                        "&appId=8e186776&appKey=13199948aaf601caae188c76f4d5881b"
                })
                .done(function(data) {
                    self.$searchList.html('');
                    if (!(data.hits.length > 0)) {
                        self.displayMessage('No results found');
                    }
                    else {
                        for (var i = 0; i < data.hits.length; i++) {
                            self.$searchList.append(self.searchTemplate({
                                result: data.hits[i].fields.item_name + " -- " + data.hits[i].fields.brand_name,
                                index: i
                            }));
                            self.searchArr.push(data.hits[i].fields);
                        }
                    }
                })
                .fail(function(error) {
                    self.$searchList.html('');
                    self.displayMessage('No results found');
                });
        } else {
            self.$searchList.html('');
        }

    },

    /*
     * When user clicks on the add button, check that all fields have values in them
     * then add a new food model to the Food collection
     */
    addItem: function() {
        if (this.$input.val() && this.$calories.val() && this.$servings.val()) {
            app.Foods.create({
                title: this.$input.val(),
                calories: this.$calories.val(),
                servings: this.$servings.val()
            });
            this.$input.val('');
            this.$calories.val('');
            this.$servings.val('');
        } else {
            //if some fields are empty, show the tooltip to the user instead
            $('.add-button').tooltip('show');
            setTimeout(function() {
                $('.add-button').tooltip('hide');
            }, 1000);
        }

    },

    /*
     * When user clicks on a search result
     * Use the saved results in searchArr to display the calories and title
     */
    clickedResult: function(event) {
        console.log(event.target.dataset.index);
        var index = event.target.dataset.index;
        this.$calories.val(this.searchArr[index].nf_calories);
        this.$searchList.html('');
        this.$input.val(this.searchArr[index].item_name + ' -- ' + this.searchArr[index].brand_name);
    },

    /*
     * Calculate the running total calories
     */
    getTotal: function(foodsList) {
        var total = 0;
        foodsList.each(function(food) {
            total += food.get('calories') * food.get('servings');
        });
        return total;
    },

    /*
     * Display some helpful messages to the user such as loading... and if no results were found
     */
    displayMessage: function(message) {
        this.$searchList.append(this.searchTemplate({
            result: message,
            index: 0
        }));
    }

});