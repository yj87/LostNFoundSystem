CREATE DATABASE IF NOT EXISTS XIANG_EN_HAMPER;
USE XIANG_EN_HAMPER;

CREATE TABLE IF NOT EXISTS Customer(
customerID VARCHAR(10) PRIMARY KEY,
cusName VARCHAR(50) NOT NULL,
customerContact VARCHAR(13) NOT NULL); 

CREATE TABLE IF NOT EXISTS UserPass(
username VARCHAR(20) PRIMARY KEY,
accPassword VARCHAR(20));

CREATE TABLE IF NOT EXISTS DeliveryStaff(
staffID VARCHAR(10) PRIMARY KEY,
staffName VARCHAR(50) NOT NULL,
position VARCHAR(30) NOT NULL,
username VARCHAR(20) NOT NULL,
licenseNumber VARCHAR(20) NOT NULL,
CONSTRAINT ds_fk_user FOREIGN KEY (username) REFERENCES UserPass(username));

CREATE TABLE IF NOT EXISTS CustomerService (
staffID VARCHAR(10) PRIMARY KEY,
staffName VARCHAR(50) NOT NULL,
position VARCHAR(30) NOT NULL,
username VARCHAR(20) NOT NULL,
CONSTRAINT cs_fk_user FOREIGN KEY (username) REFERENCES UserPass(username));

CREATE TABLE IF NOT EXISTS ProductionTeam(
staffID VARCHAR(10) PRIMARY KEY,
staffName VARCHAR(50) NOT NULL,
position VARCHAR(30) NOT NULL,
username VARCHAR(20) NOT NULL,
workingShift VARCHAR(20),
CONSTRAINT pt_fk_user FOREIGN KEY (username) REFERENCES UserPass(username));

CREATE TABLE IF NOT EXISTS Manager(
staffID VARCHAR(10) PRIMARY KEY,
staffName VARCHAR(50) NOT NULL,
position VARCHAR(30) NOT NULL,
username VARCHAR(20) NOT NULL,
salesKPI DECIMAL(10,2),
CONSTRAINT m_fk_user FOREIGN KEY (username) REFERENCES UserPass(username));

CREATE TABLE IF NOT EXISTS Hamper(
hamperID VARCHAR(10) PRIMARY KEY,
hamperType VARCHAR(20),
quantityAvailable INT,
hamperPrice DECIMAL(8,2));

CREATE TABLE IF NOT EXISTS Payment(
paymentID VARCHAR(10) PRIMARY KEY,
paymentMethod VARCHAR(20),
receiptNo VARCHAR(20) UNIQUE);

CREATE TABLE IF NOT EXISTS Order_(
orderID VARCHAR(10) PRIMARY KEY,
totalPrice DECIMAL (10,2),
orderStatus VARCHAR(15) NOT NULL,
recipientStreet VARCHAR(100),
recipientCity VARCHAR(15),
recipientPostcode VARCHAR(10),
recipientState VARCHAR(20),
customerID VARCHAR(10),
csstaffID VARCHAR(10),
ptstaffID VARCHAR(10),
paymentID VARCHAR(10),
CONSTRAINT order_fk1 FOREIGN KEY (customerID) references Customer(customerID),
CONSTRAINT ord_fk_cs FOREIGN KEY (csstaffID) REFERENCES CustomerService(staffID),
CONSTRAINT ord_fk_pt FOREIGN KEY (ptstaffID) REFERENCES ProductionTeam(staffID),
CONSTRAINT order_fk3 FOREIGN KEY (paymentID) references Payment(paymentID));

CREATE TABLE IF NOT EXISTS OrderItem(
orderID VARCHAR(10),
quantityOrder INT,
hamperID VARCHAR(10),
CONSTRAINT OrderItem_fk1 FOREIGN KEY (orderID) REFERENCES Order_(orderID),
CONSTRAINT OrderItem_fk2 FOREIGN KEY (hamperID) REFERENCES Hamper(hamperID),
CONSTRAINT OrderItem_pk PRIMARY KEY (orderID,hamperID));

CREATE TABLE IF NOT EXISTS Delivery(
deliveryID VARCHAR(10) PRIMARY KEY,
orderID VARCHAR(10),
staffID VARCHAR(10),
courierContact VARCHAR(13),
deliveryStatus VARCHAR(20),
deliveryDate DATE,
CONSTRAINT Delivery_fk1 FOREIGN KEY (orderID) REFERENCES Order_(orderID),
CONSTRAINT Delivery_fk2 FOREIGN KEY (staffID) REFERENCES DeliveryStaff(staffID));

CREATE TABLE IF NOT EXISTS Report(
reportID VARCHAR(10) PRIMARY KEY,
reportDate DATE,
staffID VARCHAR(10),
CONSTRAINT Report_fk1 FOREIGN KEY (staffID) REFERENCES Manager(staffID));


DROP DATABASE IF EXISTS XIANG_EN_HAMPER;