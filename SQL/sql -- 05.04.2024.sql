drop table UserBudgetSheet;
drop table TransactionCategory;
drop table BudgetSheet;
drop table Transactions;
drop table User_Bio;
drop table Savings;
drop table Users;



-- Users table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE,
    notifications_enabled BOOLEAN DEFAULT FALSE,
    balance DECIMAL(10, 2) DEFAULT 0,
    guardian_user_id INT, -- Added column to reference guardian user_id
    FOREIGN KEY (guardian_user_id) REFERENCES Users(user_id)
);

-- Savings table
CREATE TABLE Savings (
    saving_id Serial PRIMARY KEY,
    user_id INT,
    goal DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    weekly_saving_amount DECIMAL(10, 2),
    weeks_to_goal INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Transaction Category table

CREATE TABLE TransactionCategory (
    category_id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(20) CHECK(transaction_type IN ('income', 'spending'))
);

-- Transactions table
CREATE TABLE Transactions (
    transaction_id Serial PRIMARY KEY,
    user_id INT,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    receipt_image BYTEA,
    notes TEXT,
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (category_id) REFERENCES TransactionCategory(category_id)
);

-- User_Bio table
CREATE TABLE User_Bio (
    user_id INT PRIMARY KEY,
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);


INSERT INTO TransactionCategory (category, transaction_type) VALUES
('Groceries', 'spending'),
('Salary', 'income'),
('Utilities', 'spending'),
('Rent', 'spending'),
('Healthcare', 'spending'),
('Transportation', 'spending'),
('Entertainment', 'spending'),
('Clothing', 'spending'),
('Education', 'spending'),
('Gifts', 'spending'),
('Travel', 'spending'),
('Savings', 'income'),
('Bonus', 'income');
