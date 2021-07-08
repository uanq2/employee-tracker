const inquirer = require('inquirer');
require('console.table');
const db = require('./db');
const { listenerCount } = require('./db/connection');

// function which prompts the user for what action they should take
const start = () => {
    inquirer
        .prompt({
            name: 'input',
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
            } else if (answer.input === 'UPDATE EMPLOYEES ROLE') {
                updateEmployeeRole();
            } else if (answer.input === 'UPDATE EMPLOYEES MANAGER') {
                updateEmployeeManager();
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
start();

// Done
const viewEmployees = async () => {
    const employees = await db.findAllEmployees();
    console.table(employees);
    start();
};
// Done
const viewRoles = async () => {
    const roles = await db.findAllRoles();
    console.table(roles);
    start();
};
// Done
const viewDepartments = async () => {
    const department = await db.findAllDepartments();
    console.table(department);
    start();
};

// function to add a new employee
// Done
const addEmployee = async () => {
    const employee = await
        inquirer
            .prompt([
                {
                    name: 'first_name',
                    type: 'input',
                    message: 'What is the employee\'s first name?',
                },
                {
                    name: 'last_name',
                    type: 'input',
                    message: 'What is the employee\'s last name?',
                },
            ]);

    const roles = await db.findAllRoles();
    // console.log('test', roles);
    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id,
    }));
    const { roleId } = await inquirer.prompt({
        type: 'list',
        name: 'roleId',
        message: 'What is the Employee\'s role',
        choices: roleChoices
    });
    // console.log(employee, roleId);
    const employees = await db.findAllEmployees();
    employee.role_id = roleId;
    const managerChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }))
    managerChoices.unshift({ name: "None", value: null });
    const { managerId } = await inquirer.prompt({
        type: 'list',
        name: 'managerId',
        message: 'What is the Employee\'s manager',
        choices: managerChoices
    });
    employee.manager_id = managerId;
    await db.createEmployee(employee);
    console.log(
        `Added ${employee.first_name} ${employee.last_name} to the database`
    );
    start();
};

// Done
const addDepartment = async () => {
    const department = await
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'What is the department\'s name?'
                },
            ]);
    await db.createDepartment(department);
    console.log(
        `Added ${department.name} to the database`
    );
    start();
};

// Done
const addRole = async () => {
    const departments = await db.findAllDepartments();
    const departmentChoices = departments.map(({ id, name }) => ({
        name: name, value: id
    }))
    const role = await
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'What is the role\'s name?'
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'What is the role\'s salary?'
                },
                {
                    type: 'list',
                    name: 'department_id',
                    message: 'Which department does the role belong to?',
                    choices: departmentChoices
                }
            ]);
    await db.createRole(role);
    console.log(
        `Added ${role.title} to the database`
    );
    start();
};

const updateEmployeeRole = async () => {
    const employees = await db.findAllEmployees();
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: first_name + ' ' + last_name, value: id
    }));
    const { employeeId } = await
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: 'What employee would you like to update?',
                    choices: employeeChoices
                },
            ]);
    const roles = await db.findAllRoles();
    // console.log('test', roles);
    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id,
    }));
    const { roleId } = await inquirer.prompt({
        type: 'list',
        name: 'roleId',
        message: 'What is the Employee\'s new role',
        choices: roleChoices
    });
    await db.updateEmployeeRole(employeeId, roleId);
    console.log('Updated employee\s role');
    start();
};

const updateEmployeeManager = async () => {
    const employees = await db.findAllEmployees();
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: first_name + ' ' + last_name, value: id
    }));
    const { employeeId } = await
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: 'What employee would you like to update?',
                    choices: employeeChoices
                },
            ]);
    const manager = await db.findAllPossibleManagers(employeeId);
    const managerChoices = manager.map(({ id, first_name, last_name }) => ({
        name: first_name + ' ' + last_name, value: id
    }));
    const { managerId } = await inquirer.prompt({
        type: 'list',
        name: 'managerId',
        message: 'Who is the Employee\'s new manager',
        choices: managerChoices
    });
    await db.updateEmployeeManager(employeeId, managerId);
    console.log('Updated employee\'s role');
    start();
};
