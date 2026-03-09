USE DB_SQL;

-- Device types
INSERT INTO DeviceType (DeviceTypeName) VALUES
('Computer'),
('Laptop'),
('Server'),
('Tablet');


-- Rooms
INSERT INTO Rooms (RoomName, DeviceTypeID) VALUES
('Room 101', 1),
('Room 102', 1),
('Room 201', 2),
('Server Room', 3),
('Conference Room', 4);


-- Vendors
INSERT INTO Vendors (VendorName, Email, Password) VALUES
('Microsoft', 'contact@microsoft.com', 'pass123'),
('Adobe', 'support@adobe.com', 'pass123'),
('JetBrains', 'info@jetbrains.com', 'pass123'),
('Oracle', 'help@oracle.com', 'pass123');


-- Software categories
INSERT INTO SoftwareCategories (CategoryName, ParentCategoryID) VALUES
('Operating Systems', NULL),
('Office Software', NULL),
('Development Tools', NULL),
('Database Systems', NULL),
('IDEs', 3);


-- Software
INSERT INTO Software (SoftwareName, VendorID, CategoryID) VALUES
('Windows 11', 1, 1),
('Microsoft Office', 1, 2),
('Adobe Photoshop', 2, 2),
('IntelliJ IDEA', 3, 5),
('Oracle Database', 4, 4),
('PyCharm', 3, 5);


-- Licenses
INSERT INTO Licenses (SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount) VALUES
(1, 1, '2023-01-10', '2026-01-10', 120.00, 20),
(2, 1, '2023-02-15', '2025-02-15', 250.00, 15),
(3, 2, '2023-03-01', '2024-03-01', 300.00, 10),
(4, 3, '2023-05-10', '2026-05-10', 500.00, 8),
(5, 4, '2022-09-20', '2027-09-20', 1000.00, 5),
(6, 3, '2024-01-12', '2027-01-12', 400.00, 12);

INSERT INTO Licenses (SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount) VALUES
(4, 1, '2023-01-10', '2026-07-10', 500.00, 20);