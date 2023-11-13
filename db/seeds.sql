USE employee_management;

-- Departments
INSERT INTO department (name)
VALUES ("Research and Development"),
("Customer Success"),
("Human Resources"),
("Product Management");

-- Roles
INSERT INTO role (title, salary, department_id)
VALUES ("Senior Developer", 120000, 1),
("Customer Success Manager", 95000, 2),
("HR Specialist", 80000, 3),
("Product Manager", 140000, 4),
("Front-end Developer", 110000, 1),
("Backend Developer", 115000, 1),
("Marketing Coordinator", 75000, 4),
("Sales Representative", 90000, 2);

-- Employees
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Alice", "Johnson", 1, NULL),
("Bob", "Anderson", 6, 1),
("Charlie", "Smith", 2, NULL),
("Diana", "Roberts", 3, 3),
("Eva", "Clark", 7, NULL),
("Frank", "Taylor", 5, 5),
("Grace", "Martin", 4, NULL),
("Henry", "Baker", 8, 7);
