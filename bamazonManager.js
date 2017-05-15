// Create a new Node application called bamazonManager.js. Running this application will:
// List a set of menu options:
// View Products for Sale
// View Low Inventory
// Add to Inventory
// Add New Product
// If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
// If a manager selects View Low Inventory, then it should list all items with a inventory count lower than five.
// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.


//Connect to DB:
var mysql = require("mysql");
var columnify = require('columnify');
var inquirer = require("inquirer");
var columns = columnify(data, options);
var options = "";
var data = "";
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "something",
    database: "Bamazon"
});

managerOptions()

function managerOptions() {
    inquirer.prompt([{
        type: "list",
        name: "start",
        message: "What would you like to do, Mr. Manager?",
        choices: ["View Products for Sale", "View Low Inventory", "Add Inventory a current item", "Add New Product"]
    }]).then(function(input) {
        if (input.start === "View Products for Sale") {
            // If a manager selects View Products for Sale, the app should list every available item: the item IDs, names, prices, and quantities.
            viewProducts();

        } else if (input.start === "View Low Inventory") {
            // If a manager selects View Low Inventory, then it should list all items with a inventory count lower than five.
            viewLow();
            // managerOptions();

        } else if (input.start === "Add Inventory a current item") {
            // If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
            selectID();

        } else if (input.start === "Add New Product") {
            // If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
            addItem();
        }
    });
}

function viewProducts() {
    connection.query("SELECT id, product_name, price, stock_quantity FROM products", function(err, managerData) {
        if (err) throw err;
        var columns = columnify(managerData, {
            minWidth: 20,
            config: {
                description: { maxWidth: 30 }
            }
        })
        console.log(columns);
        managerOptions()
    });
}

function viewLow() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 500 ORDER BY stock_quantity", function(err, data) {
        var columns = columnify(data, {
            minWidth: 20,
            config: {
                description: { maxWidth: 30 }
            }
        });
        console.log(columns);
        managerOptions();
    });
}

function selectID() {
    inquirer.prompt([{
        type: "input",
        name: "selectedID",
        message: "What item you like to add? (use item id to select)"
    }, {
        type: "input",
        name: "add",
        message: "How many would you like to add?"
    }]).then(function(input) {
        connection.query("SELECT stock_quantity, product_name, price FROM products WHERE ?", { "products.id": input.selectedID }, function(err, data) {
            if (parseInt(input.add) > 0) {
                var stockLeft = parseInt(data[0].stock_quantity) + parseInt(input.add);
                var totalPrice = parseInt(input.add) * parseFloat(data[0].price);

                connection.query("UPDATE products SET ? WHERE ?", [{
                        "stock_quantity": parseInt(data[0].stock_quantity) + parseInt(input.add)
                    }, { "products.id": parseInt(input.selectedID) }]),
                    function(err, data) {}
                console.log("Thank you for adding " + data[0].product_name + ". We now have " + stockLeft + " left.");
                managerOptions();
            } else {
                console.log("blah")
            }
        });
    });
}

function addItem() {
    inquirer.prompt([{
        type: "input",
        name: "item_name",
        message: "What's the name of the item you would like to add?"
    }, {
        type: "input",
        name: "dept_name",
        message: "What's department is your item in?"
    }, {
        type: "input",
        name: "price",
        message: "What's the price per unit?"
    }, {
        type: "input",
        name: "stock",
        message: "What's the starting quantity?"
    }]).then(function(input) {
        connection.query("INSERT INTO products SET?", {
            product_name: input.item_name,
            department_name: input.dept_name,
            price: input.price,
            stock_quantity: input.stock
        }, function(err, data) {
            if (err) throw err;
            console.log("You created an item!");
            managerOptions();
        });
    });
};