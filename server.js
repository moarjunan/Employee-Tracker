import inquirer from 'inquirer';
import express from 'express';
import connection from './db/connection.js';

import {
    viewDepartments,
    viewRoles,
    viewEmployees,
    addRole,
    addEmployee,
    addDepartment,
    updateEmployee
} from './function.js';

const PORT = 3001;
const app = express();

async function start() {
    try {
        // Connect to the database
        await connectToDatabase();

        // Start the main menu
        await mainMenu();
    } catch (error) {
        console.error("Error:", error);
    } finally {
        // Close the database connection when done
        connection.end();
    }
}

async function connectToDatabase() {
    try {
        await connection.execute('SELECT 1');
        console.log("Connected to Database successfully!");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
}


async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Exit",
      ],
    },
  ]);

  switch (action) {
    case "View all departments":
      await viewDepartments(connection);
      break;
    case "View all roles":
      await viewRoles(connection);
      break;
    case "View all employees":
      await viewEmployees(connection);
      break;
    case "Add a department":
      await addDepartment(connection);
      break;
    case "Add a role":
      await addRole(connection);
      break;
    case "Add an employee":
      await addEmployee(connection);
      break;
    case "Update an employee role":
      await updateEmployee(connection);
      break;
    case "Exit":
      console.log("Goodbye!");
      process.exit();
  }

  // After completing the action, call the mainMenu function again for the next iteration
  await mainMenu();
}

// Start the application
app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
  start();
});
