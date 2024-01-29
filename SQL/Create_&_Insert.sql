-- Drop the tables
DROP TABLE TransactionLogs;
DROP TABLE Guardian_Information;
DROP TABLE CustomerInformation;



-- Create tables with IDENTITY property
CREATE TABLE CustomerInformation (
    AccountNo VARCHAR(255) NOT NULL PRIMARY KEY,
    FirstName VARCHAR(255) NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    DOB DATE NOT NULL,
    PIN VARCHAR(255) NOT NULL,
    Balance INT NOT NULL 
);

CREATE TABLE Guardian_Information (
    GuardianID VARCHAR(255) NOT NULL PRIMARY KEY,
    FirstName VARCHAR(255) NOT NULL,
    LastName VARCHAR(255) NOT NULL,
    DOB DATE NOT NULL,
    AccessLevel VARCHAR(255) CHECK (AccessLevel IN ('Low', 'Medium', 'Full')) NOT NULL,
    CustomerInformation_AccountNo VARCHAR(255) NOT NULL,
    FOREIGN KEY (CustomerInformation_AccountNo) REFERENCES CustomerInformation(AccountNo)
);

CREATE TABLE TransactionLogs (
    TransactionID VARCHAR(255) NOT NULL PRIMARY KEY,
    TransactionType VARCHAR(255) NOT NULL,
    Amount INT NOT NULL,
    CustomerInformation_AccountNo VARCHAR(255) NOT NULL,
    FOREIGN KEY (CustomerInformation_AccountNo) REFERENCES CustomerInformation(AccountNo)
);

insert into customerinformation (AccountNo, FirstName, LastName, DOB, PIN, Balance)
VALUES 
('C123456789', 'John', 'Doe', '1990-01-01', '1234', 1000),
('C123432411', 'Connor', 'Lee', '2000-02-01', '2345', 2000),
('C143212311', 'Mike', 'Coxs', '2002-06-01', '4532', 10000),
('C231411132', 'Shane', 'Murphy', '2003-07-01', '2213', 100);

INSERT INTO Guardian_Information (GuardianID, FirstName, LastName, DOB, AccessLevel, CustomerInformation_AccountNo)
VALUES ('G123456789', 'Helen', 'Kells', '1990-01-01', 'Low', 'C123456789'),
       ('G987654321', 'James', 'Born', '1985-05-15', 'Medium', 'C123432411'),
       ('G123154321', 'Ciaran', 'Smith', '1989-01-05', 'Medium', 'C143212311'),
       ('G200052321', 'Mary', 'Smith', '1940-11-10', 'Full', 'C231411132');

INSERT INTO TransactionLogs (TransactionID, TransactionType, Amount, CustomerInformation_AccountNo)
VALUES ('T123456789', 'Deposit', 500, 'C123456789'),
	   ('T123123189', 'Deposit', 500, 'C123432411'),
       ('T977221021', 'Withdrawal', 200, 'C231411132'),
       ('T008921321', 'Withdrawal', 200, 'C143212311');