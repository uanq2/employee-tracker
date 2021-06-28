const mysql = require('mysql');
const inquirer = require('inquirer');

// create the connection information for the sql database
const connection = mysql.createConnection({
    host: 'localhost',

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: 'root',

    // Your password
    password: 'Sebit@s0220',
    database: 'employees_db',
});

// function which prompts the user for what action they should take
const start = () => {
    inquirer
        .prompt({
            name: 'INPUT',
            type: 'list',
            message: 'What would you like to do?',
            choices: ['VIEW ALL EMPLOYEES', 'ADD EMPLOYEE', 'UPDATE EMPLOYEE ROLE', 'VIEW DEPARTMENTS', 'ADD DEPARTMENT', 'VIEW ROLES', 'ADD ROLE', 'EXIT'],
        })
        .then((answer) => {
            // based on their answer, a selection of options are shown.
            if (answer.input === 'VIEW ALL EMPLOYEES') {
                viewEmployees();
            } else if (answer.input === 'ADD EMPLOYEE') {
                addEmployee();
            } else if (answer.input === 'UPDATE EMPLOYEE ROLE') {
                updateEmployeeRole();
            } else if (answer.input === 'VIEW DEPARTMENTS') {
                viewDepartments();
            } else if (answer.input === 'ADD DEPARTMENT') {
                addDepartment();
            } else if (answer.input === 'VIEW ROLES') {
                viewRoles();
            } else if (answer.input === 'ADD ROLE') {
                addRole();
            } else {
                connection.end();
            }
        });
};

const viewEmployees = () => {
    connection.query('SELECT employee.first_name, employee.last_name FROM employee', (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    })
};

// function to add a new employee
const addEmployee = () => {
    inquirer
        .prompt([
            {
                name: 'firstname',
                type: 'input',
                message: 'What is the employee\'s first name?',
            },
            {
                name: 'lastname',
                type: 'input',
                message: 'What is the employee\'s last name?',
            },
            {
                name: 'roleId',
                type: 'list',
                message: 'What is the employee\'s role?',
                choices() {
                    const choiceArray = [];
                    res.forEach(({ id, title }) => {
                        choiceArray.push({ name: title, value: id });
                    });
                    return choiceArray;
                },
            },
        ])
        .then((answer) => {
            // when finished prompting, insert a new item into the db with that info
            connection.query(
                'INSERT INTO employee SET ?',
                // QUESTION: What does the || 0 do?
                {
                    first_name: answer.firstname,
                    last_name: answer.lastname,
                    role_id: answer.roleId,
                },
                (err) => {
                    if (err) throw err;
                    console.log('You have added a new employee successfully!');
                    // re-prompt the user for if they want to bid or post
                    start();
                }
            );
        });
};

const updateEmployeeRole = () => {
    connection.query('SELECT * FROM employee', (err, results) => {
        connection.query('SELECT * FROM role', (err, results) => {
            inquirer
                .prompt([
                    {
                        name: 'choiceName',
                        type: 'list',
                        message: 'What employee would you like to update?',
                        choices() {
                            const choiceArray = [];
                            results.forEach(({ id, first_name }) => {
                                choiceArray.push({ name: first_name, value: id });
                            });
                            return choiceArray;
                        },
                    },
                    {
                        name: 'choiceRole',
                        type: 'list',
                        message: 'What is the new role?',
                        choices() {
                            const choiceArray = [];
                            results.forEach(({ id, title }) => {
                                choiceArray.push({ name: title, value: id });
                            });
                            return choiceArray;
                        }
                    },
                ])
                .then((answer) => {
                    // get the information of the chosen item
                    let chosenItem;
                    results.forEach((item) => {
                        if (item.item_name === answer.choice) {
                            chosenItem = item;
                        }
                    });

                    // determine if bid was high enough
                    if (chosenItem.highest_bid < parseInt(answer.bid)) {
                        // bid was high enough, so update db, let the user know, and start over
                        connection.query(
                            'UPDATE auctions SET ? WHERE ?',
                            [
                                {
                                    highest_bid: answer.bid,
                                },
                                {
                                    id: chosenItem.id,
                                },
                            ],
                            (error) => {
                                if (error) throw err;
                                console.log('Bid placed successfully!');
                                start();
                            }
                        );
                    } else {
                        // bid wasn't high enough, so apologize and start over
                        console.log('Your bid was too low. Try again...');
                        start();
                    }
                });
        });
    }

    // connect to the mysql server and sql database
    connection.connect((err) => {
        if (err) throw err;
        // run the start function after the connection is made to prompt the user
        start();
    });
