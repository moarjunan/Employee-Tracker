// connection.js
import mysql from 'mysql2/promise';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'employee_management'
});

export default connection;

// function.js
import inquirer from 'inquirer';
import consoleTable from 'console.table';

async function viewDepartments(connection) {
    try {
        const [results] = await connection.query('Select * from department');
        console.log();
        console.table(results);
    } catch (error) {
        console.error('Error fetching table names:', error);
    }
}

async function viewRoles(connection) {
    try {
        const [results] = await connection.query(`
            SELECT r.id, r.title, r.salary, d.name AS department
            FROM role AS r
            LEFT JOIN department AS d ON r.department_id = d.id
        `);
        console.log();
        console.table(results);
    } catch (error) {
        console.error('Error fetching table names:', error);
    }
}

async function viewEmployees(connection) {
    try {
        const [results] = await connection.query(`
            SELECT
                e.id,
                e.first_name,
                e.last_name,
                r.title AS role,
                CONCAT(m.first_name, ' ', m.last_name) AS manager
            FROM employee AS e
            LEFT JOIN role AS r ON e.role_id = r.id
            LEFT JOIN employee AS m ON e.manager_id = m.id
        `);
        console.log();
        console.table(results);
    } catch (error) {
        console.error('Error fetching table names:', error);
    }
}

async function addDepartment(connection) {
    try {
        const departmentName = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter the department name:',
            },
        ]);

        const [result] = await connection.query('INSERT INTO department (name) VALUES (?)', [departmentName.name]);

        console.log(`Department '${departmentName.name}' added successfully.`);
    } catch (error) {
        console.error('Error adding department:', error);
    }
}

async function addRole(connection) {
    try {
        const departmentQuery = 'SELECT id, name FROM department';

        const [departments] = await connection.query(departmentQuery);

        const departmentChoices = departments.map(department => ({
            name: department.name,
            value: department.id,
        }));

        const roleDetails = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the Title name:',
            },
            {
                type: 'number',
                name: 'salary',
                message: 'Enter the role salary:',
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the department for this role:',
                choices: departmentChoices,
            },
        ]);

        await connection.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [
            roleDetails.title,
            roleDetails.salary,
            roleDetails.department_id,
        ]);

        console.log(`Role '${roleDetails.title}' added successfully.`);
    } catch (error) {
        console.error('Error adding role:', error);
    }
}

async function addEmployee(connection) {
    try {
        const roleQuery = 'SELECT id, title FROM role';
        const managerQuery = 'SELECT id, first_name, last_name FROM employee';

        const [roles, managers] = await Promise.all([
            connection.query(roleQuery),
            connection.query(managerQuery),
        ]);

        const roleChoices = roles[0].map(role => ({
            name: role.title,
            value: role.id,
        }));
        const managerChoices = managers[0].map(manager => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id,
        }));

        const employeeDetails = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter the First name:',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter the Last name:',
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the role for this employee:',
                choices: roleChoices,
            },
            {
                type: 'list',
                name: 'manager_id',
                message: 'Select the manager for this employee (or leave empty for no manager):',
                choices: [...managerChoices, { name: 'None', value: null }],
            },
        ]);

        await connection.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [
            employeeDetails.firstName,
            employeeDetails.lastName,
            employeeDetails.role_id,
            employeeDetails.manager_id,
        ]);

        console.log(`Employee added successfully.`);
    } catch (error) {
        console.error('Error adding employee:', error);
    }
}

async function updateEmployee(connection) {
    try {
        const employeeQuery = 'SELECT id, first_name, last_name FROM employee';
        const roleQuery = 'SELECT id, title FROM role';

        const [employees, roles] = await Promise.all([
            connection.query(employeeQuery),
            connection.query(roleQuery),
        ]);

        const employeeChoices = employees[0].map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));
        const roleChoices = roles[0].map(role => ({
            name: role.title,
            value: role.id,
        }));

        const userInput = await inquirer.prompt([
            {
                type: 'list',
                name: 'employee_id',
                message: 'Select the employee you want to update:',
                choices: employeeChoices,
            },
            {
                type: 'list',
                name: 'field_to_update',
                message: 'Select the field to update:',
                choices: ['First Name', 'Last Name', 'Role'],
            },
            {
                type: 'input',
                name: 'new_value',
                message: 'Enter the new value:',
                when: (answers) => answers.field_to_update !== 'Role',
            },
            {
                type: 'list',
                name: 'new_role_id',
                message: 'Select the new role:',
                choices: roleChoices,
                when: (answers) => answers.field_to_update === 'Role',
            },
        ]);

        const { employee_id, field_to_update, new_value, new_role_id } = userInput;

        let updateQuery, updateParams;

        switch (field_to_update) {
            case 'First Name':
                updateQuery = 'UPDATE employee SET first_name = ? WHERE id = ?';
                updateParams = [new_value, employee_id];
                break;
            case 'Last Name':
                updateQuery = 'UPDATE employee SET last_name = ? WHERE id = ?';
                updateParams = [new_value, employee_id];
                break;
            case 'Role':
                updateQuery = 'UPDATE employee SET role_id = ? WHERE id = ?';
                updateParams = [new_role_id, employee_id];
                break;
        }

        await connection.query(updateQuery, updateParams);
        console.log(`Employee with ID ${employee_id} has been updated.`);
    } catch (error) {
        console.error('Error updating employee:', error);
    }
}

export {
    viewDepartments,
    viewRoles,
    viewEmployees,
    addRole,
    addEmployee,
    addDepartment,
    updateEmployee
};

