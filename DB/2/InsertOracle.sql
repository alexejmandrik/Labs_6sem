show con_name;
ALTER SESSION SET CONTAINER = XEPDB1;

INSERT INTO DeviceType (DeviceTypeName) VALUES ('Computer');
INSERT INTO DeviceType (DeviceTypeName) VALUES ('Laptop');
INSERT INTO DeviceType (DeviceTypeName) VALUES ('Server');
INSERT INTO DeviceType (DeviceTypeName) VALUES ('Tablet');

INSERT INTO Rooms (RoomName, DeviceTypeID) VALUES ('Room 101', 1);
INSERT INTO Rooms (RoomName, DeviceTypeID) VALUES ('Room 102', 1);
INSERT INTO Rooms (RoomName, DeviceTypeID) VALUES ('Room 201', 2);
INSERT INTO Rooms (RoomName, DeviceTypeID) VALUES ('Server Room', 3);
INSERT INTO Rooms (RoomName, DeviceTypeID) VALUES ('Conference Room', 4);

INSERT INTO Vendors (VendorName, Email, Password) VALUES ('Microsoft', 'contact@microsoft.com', 'pass123');
INSERT INTO Vendors (VendorName, Email, Password) VALUES ('Adobe', 'support@adobe.com', 'pass123');
INSERT INTO Vendors (VendorName, Email, Password) VALUES ('JetBrains', 'info@jetbrains.com', 'pass123');
INSERT INTO Vendors (VendorName, Email, Password) VALUES ('Oracle', 'help@oracle.com', 'pass123');

INSERT INTO SoftwareCategories (CategoryName, ParentCategoryID) VALUES ('Operating Systems', NULL);
INSERT INTO SoftwareCategories (CategoryName, ParentCategoryID) VALUES ('Office Software', NULL);
INSERT INTO SoftwareCategories (CategoryName, ParentCategoryID) VALUES ('Development Tools', NULL);
INSERT INTO SoftwareCategories (CategoryName, ParentCategoryID) VALUES ('Database Systems', NULL);
INSERT INTO SoftwareCategories (CategoryName, ParentCategoryID) VALUES ('IDEs', 3);

INSERT INTO Software (SoftwareName, VendorID, CategoryID) VALUES ('Windows 11', 1, 1);
INSERT INTO Software (SoftwareName, VendorID, CategoryID) VALUES ('Microsoft Office', 1, 2);
INSERT INTO Software (SoftwareName, VendorID, CategoryID) VALUES ('Adobe Photoshop', 2, 2);
INSERT INTO Software (SoftwareName, VendorID, CategoryID) VALUES ('IntelliJ IDEA', 3, 5);
INSERT INTO Software (SoftwareName, VendorID, CategoryID) VALUES ('Oracle Database', 4, 4);
INSERT INTO Software (SoftwareName, VendorID, CategoryID) VALUES ('PyCharm', 3, 5);


INSERT INTO Licenses (SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount)
VALUES (1, 1, DATE '2023-01-10', DATE '2026-01-10', 120.00, 20);

INSERT INTO Licenses (SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount)
VALUES (2, 1, DATE '2023-02-15', DATE '2025-02-15', 250.00, 15);

INSERT INTO Licenses (SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount)
VALUES (3, 2, DATE '2023-03-01', DATE '2024-03-01', 300.00, 10);

INSERT INTO Licenses (SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount)
VALUES (4, 3, DATE '2023-05-10', DATE '2026-05-10', 500.00, 8);

INSERT INTO Licenses (SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount)
VALUES (5, 4, DATE '2022-09-20', DATE '2027-09-20', 1000.00, 5);

INSERT INTO Licenses (SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount)
VALUES (6, 3, DATE '2024-01-12', DATE '2027-01-12', 400.00, 12);


INSERT INTO Licenses (SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount)
VALUES (4, 2, DATE '2023-05-10', DATE '2026-05-10', 500.00, 20);
