const inquirer = require('inquirer');
const mysql = require('mysql2');
const util = require('util');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employee_tracker',
});

const queryAsync = util.promisify(connection.query).bind(connection);

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database.');
    startApplication();
});

// prompts and what happens when choices have been selected
function startApplication() {
    inquirer
        .prompt({
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Delete a department',
                'Delete a role',
                'Delete a employee',
                'Exit',
            ],
        })
        .then(async (answer) => {
            switch (answer.action) {
                case 'View all departments':
                    viewAllDepartments();
                    break;

                case 'View all roles':
                    viewAllRoles();
                    break;

                case 'View all employees':
                    viewAllEmployees();
                    break;

                case 'Add a department':
                    addDepartment();
                    break;

                case 'Add a role':
                    addRole();
                    break;

                case 'Add an employee':
                    addEmployee();
                    break;

                case 'Update an employee role':
                    updateEmployeeRole();
                    break;

                case 'Delete a department':
                    deleteDepartment();
                    break;

                case 'Delete a role':
                    deleteRole();
                    break;

                case 'Delete a employee':
                    await deleteEmployee();
                    break;

                case 'Exit':
                    connection.end();
                    break;
            };
        });
};
// see all departments section
async function viewAllDepartments() {
    try {
        const results = await queryAsync(`SELECT * FROM department`);
        console.table(results);

        startApplication();
    } catch (error) {
        console.error(error);
        startApplication();
    };
};
//see roles section
async function viewAllRoles() {
    try {
        const results = await queryAsync(`SELECT * FROM roles`);
        console.table(results);
        startApplication();
    } catch (error) {
        console.error(error);
        startApplication();
    };
};

//see all employee section
async function viewAllEmployees() {
    try {
        const results = await queryAsync(`SELECT * FROM employee`);
        console.table(results);
        startApplication();
    } catch (error) {
        console.error(error);
        startApplication();
    };
};

//add department section
async function addDepartment() {
    try {
        const answer = await inquirer.prompt({
            type: 'input',
            name: 'departmentName',
            message: 'Enter the name of the department:',
        });

        await queryAsync('INSERT INTO department SET ?', { name: answer.departmentName });
        console.log('Department added successfully!');
        startApplication();
    } catch (error) {
        console.error(error);
        startApplication();
    };
};

// functions that add to role/employee/update
async function addRole() {
    try {

        const departments = await queryAsync('SELECT * FROM department');

        const departmentChoices = departments.map((department) => ({
            name: department.name,
            value: department.id,
        }));

        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the role:',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary for the role:',
            },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department for the role:',
                choices: departmentChoices,
            },
        ]);

        await queryAsync('INSERT INTO roles SET ?', {
            title: answer.title,
            salary: answer.salary,
            department_id: answer.departmentId,
        });

        console.log('Role added successfully!');
        startApplication();
    } catch (error) {
        console.error('Error adding role:', error);
        startApplication();
    };
};

// add employees
async function addEmployee() {
    try {
        const roles = await queryAsync('SELECT * FROM roles');
        const managers = await queryAsync('SELECT * FROM employee');
        const roleChoices = roles.map((role) => ({ name: role.title, value: role.id }));
        const managerChoices = managers.map((manager) => ({ name: `${manager.first_name} ${manager.last_name}`, value: manager.id }));

        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter the first name of the employee:',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter the last name of the employee:',
            },
            {
                type: 'list',
                name: 'roleId',
                message: 'Select the role of the employee:',
                choices: roleChoices,
            },
            {
                type: 'list',
                name: 'managerId',
                message: 'Select the manager of the employee:',
                choices: [...managerChoices, { name: 'None', value: null }],
            },
        ]);

        await queryAsync('INSERT INTO employee SET ?', {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: answer.roleId,
            manager_id: answer.managerId,
        });

        console.log('Employee added successfully!');
        startApplication();
    } catch (error) {
        console.error(error);
        startApplication();
    };
};

// updates employee roles
async function updateEmployeeRole() {
    try {

        const employees = await queryAsync('SELECT * FROM employee');
        const roles = await queryAsync('SELECT * FROM roles');

        const employeeChoices = employees.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));
        const roleChoices = roles.map((roles) => ({ name: roles.title, value: roles.id }));

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee to update:',
                choices: employeeChoices,
            },
            {
                type: 'list',
                name: 'roleId',
                message: 'Select the new role for the employee:',
                choices: roleChoices,
            },
        ]);

        await queryAsync('UPDATE employee SET role_id = ? WHERE id = ?', [answer.roleId, answer.employeeId]);

        console.log('Employee role updated successfully!');
        startApplication();
    } catch (error) {
        console.error('Error updating employee role:', error);
        startApplication();
    };
};

// deletes department
async function deleteDepartment() {
    try {
        const departments = await queryAsync('SELECT * FROM department');

        const departmentChoices = departments.map((department) => ({
            name: department.name,
            value: department.id,
        }));

        const answer = await inquirer.prompt({
            type: 'list',
            name: 'departmentId',
            message: 'Select the department to delete:',
            choices: departmentChoices,
        });

        await queryAsync('DELETE FROM department WHERE id = ?', answer.departmentId);

        console.log('Department deleted successfully!');

        const updatedDepartments = await queryAsync('SELECT * FROM department');
        console.table(updatedDepartments);

        startApplication();

    } catch (error) {
        console.error('Error deleting department:', error);
        startApplication();
    };
};

// deletes role
async function deleteRole() {
    try {
        const roles = await queryAsync('SELECT id, title FROM roles');

        const roleChoices = roles.map((roles) => ({
            name: roles.title,
            value: roles.id,
        }));

        const answer = await inquirer.prompt({
            type: 'list',
            name: 'roleId',
            message: 'Select the role to delete:',
            choices: roleChoices,
        });

        await queryAsync('DELETE FROM roles WHERE id = ?', answer.roleId);

        console.log('Role deleted successfully!');

        const updatedRoles = await queryAsync('SELECT * FROM roles');
        console.table(updatedRoles);

        startApplication();
    } catch (error) {
        console.error('Error deleting role:', error);
        startApplication();
    };
};

// deletes employee
async function deleteEmployee() {
    try {
        const employees = await queryAsync('SELECT * FROM employee');

        const employeeChoices = employees.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));

        const answer = await inquirer.prompt({
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee to delete:',
            choices: employeeChoices,
        });

        await queryAsync('DELETE FROM employee WHERE id = ?', answer.employeeId);

        console.log('Employee deleted successfully!');

        startApplication();

    } catch (error) {
        console.error('Error deleting employee:', error);
        startApplication();
    };
};