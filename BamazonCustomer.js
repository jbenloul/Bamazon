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

displayItems();

function displayItems() {
    connection.query("SELECT * FROM products", function(err, rows, fields) {
        if (err) throw err;
        var columns = columnify(rows, {
            minWidth: 30,
            config: {
                description: { maxWidth: 35 }
            }
        })
        console.log(columns)
        selectID()
    });
}


function selectID() {
    inquirer.prompt([{
        type: "input",
        name: "selectedID",
        message: "What item you like to buy? (use item id to select)"
    }, {
        type: "input",
        name: "purchase",
        message: "How many would you like to buy?"
    }]).then(function(input) {
        connection.query("SELECT stock_quantity, product_name, price FROM products WHERE ?", { "products.id": input.selectedID }, function(err, data) {
            if (parseInt(input.purchase) < parseInt(data[0].stock_quantity)) {
                var stockLeft = parseInt(data[0].stock_quantity) - parseInt(input.purchase);
                var totalPrice = parseInt(input.purchase) * parseFloat(data[0].price);

                connection.query("UPDATE products SET ? WHERE ?", [{
                        "stock_quantity": parseInt(data[0].stock_quantity) - parseInt(input.purchase)
                    }, { "products.id": parseInt(input.selectedID) }]),
                    function(err, data) {
                        console.log("Thank you for purchasing " + data[0].product_name + " for a total of" + totalPrice + ". We have " + stockLeft + "left.")
                    }
                console.log("Thank you for purchasing " + data[0].product_name + " for a total of $" + totalPrice + " and we have " + stockLeft + " left.");
            } else {
                console.log("You cant buy that many! We only have " + data[0].stock_quantity + " in our stock.")
            }    purchaseAgain();

        });
    });
}


function purchaseAgain() {
    inquirer.prompt([{
            type: "list",
            name: "anotherPurchase",
            message: "Would you like to make another purchase?",
            choices: ["Yes", "No"]
        }]).then(function(input) {
                if (input.anotherPurchase === "Yes") {
                    displayItems();
                } else {
                    console.log("Have a nice day!")
                }
            });
      }
