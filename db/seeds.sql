-- seed data for department table
INSERT INTO department (name) VALUES
("Sales"),
("Engineering"),
("Finance"),
("Legal");

-- seed data for roles table
INSERT INTO roles (title, salary, department_id) VALUES
("Sales Lead", 100000.00, 1),
("Salesperson", 80000.00, 1),
("Lead Engineer", 150000.00, 2),
("Software Engineer", 120000.00, 2),
("Account Manager", 160000.00, 3),
("Accountant", 125000.00, 3),
("Legal Team Lead", 250000.00, 3),
("Lawyer", 190000.00, 3);

-- seed data for employee table
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
("Robert", "Byrd", 1, NULL),
("Cody", "Olfati", 2, 1),
("Bijan", "Thompson", 3, NULL),
("Shaun", "Mason", 4, 1),
("Danielle", "Boseman", 3, NULL),
("Drew", "Della", 3, 1),
("Joshua", "Henson", 3, NULL),
("Kurt", "Gawe", 3, 1),
("John", "Doe", 3, NULL);