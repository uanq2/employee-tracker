const connection = require('./connection');
class DB {
    constructor(connection) {
        this.connection = connection;
    }
    findAllRoles() {
        return this.connection.query(
            'SELECT * FROM role'
        );
    }
    findAllEmployees() {
        return this.connection.query(
            'SELECT * FROM employee'
        );
    }
    findAllDepartments() {
        return this.connection.query(
            'SELECT * FROM department'
        );
    }
    createEmployee(employee) {
        return this.connection.query(
            'INSERT INTO employee SET ?', employee
        );
    }
    createDepartment(department) {
        return this.connection.query(
            'INSERT INTO department SET ?', department
        );
    }
    createRole(role) {
        return this.connection.query(
            'INSERT INTO role SET ?', role
        );
    }
    updateEmployeeRole(employeeId, roleId) {
        return this.connection.query(
            'UPDATE employee SET role_id = ? WHERE id = ?',
            [roleId, employeeId]
        )
    }
    updateEmployeeManager(employeeId, managerId) {
        return this.connection.query(
            'UPDATE employee SET manager_id = ? WHERE id = ?',
            [managerId, employeeId]
        )
    }
    findAllPossibleManagers(employeeId) {
        return this.connection.query(
            'SELECT id, first_name, last_name FROM employee WHERE id != ?',
            employeeId
        )
    }
}

module.exports = new DB(connection);
