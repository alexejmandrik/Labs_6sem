drop table DeviceType;
drop table Rooms;
drop table Vendors
drop table SoftwareCategories
drop table Software
drop table Licenses

CREATE TABLE DeviceType (
    DeviceTypeID INT IDENTITY(1,1) PRIMARY KEY,
    DeviceTypeName NVARCHAR(50) UNIQUE
);


CREATE TABLE Rooms (
    RoomID INT IDENTITY(1,1) PRIMARY KEY,
    RoomName NVARCHAR(50) UNIQUE,
    DeviceTypeID INT NOT NULL,
    CONSTRAINT FK_Rooms_DeviceType FOREIGN KEY (DeviceTypeID)
        REFERENCES DeviceType(DeviceTypeID)
);


CREATE TABLE Vendors (
    VendorID INT IDENTITY(1,1) PRIMARY KEY,
    VendorName NVARCHAR(150) NOT NULL UNIQUE,
    Email NVARCHAR(150) UNIQUE,
    Password NVARCHAR(255) NOT NULL
);


CREATE TABLE SoftwareCategories (
    CategoryId INT PRIMARY KEY IDENTITY,
    CategoryName NVARCHAR(100) NOT NULL,
    Hierarchy hierarchyid NOT NULL
);

CREATE TABLE Software (
    SoftwareID INT IDENTITY(1,1) PRIMARY KEY,
    SoftwareName NVARCHAR(150) NOT NULL,
    VendorID INT NOT NULL,
    CategoryID INT NOT NULL,
    CONSTRAINT FK_Software_Vendor FOREIGN KEY (VendorID)
        REFERENCES Vendors(VendorID),
    CONSTRAINT FK_Software_Category FOREIGN KEY (CategoryID)
        REFERENCES SoftwareCategories(CategoryID)
);


CREATE TABLE Licenses (
    LicenseID INT IDENTITY(1,1) PRIMARY KEY,
    SoftwareID INT NOT NULL,
    RoomID INT NOT NULL,
    PurchaseDate DATE NOT NULL,
    ExpirationDate DATE NOT NULL,
    Price DECIMAL(10,2) NOT NULL CHECK (Price >= 0),
    LicenseCount INT NOT NULL CHECK (LicenseCount > 0),
    CONSTRAINT FK_Licenses_Software FOREIGN KEY (SoftwareID)
        REFERENCES Software(SoftwareID),
    CONSTRAINT FK_Licenses_Room FOREIGN KEY (RoomID)
        REFERENCES Rooms(RoomID),
    CONSTRAINT CHK_Licenses_Dates CHECK (ExpirationDate >= PurchaseDate)
);

ALTER TABLE Licenses
DROP CONSTRAINT CHK_Licenses_Dates;




INSERT INTO DeviceType (DeviceTypeName) VALUES
('PC'),
('Laptop'),
('Server'),
('Tablet');

INSERT INTO Rooms (RoomName, DeviceTypeID) VALUES
('Room 101', 1),
('Room 102', 2),
('Room 201', 3),
('Room 202', 1),
('Room 301', 4);


INSERT INTO Vendors (VendorName, Email, Password) VALUES
('Microsoft', 'ms@mail.com', '123'),
('Adobe', 'adobe@mail.com', '123'),
('Oracle', 'oracle@mail.com', '123'),
('JetBrains', 'jb@mail.com', '123');

INSERT INTO SoftwareCategories (CategoryName, Hierarchy) VALUES
('Operating Systems', hierarchyid::GetRoot()),
('Office Software', hierarchyid::GetRoot()),
('Development Tools', hierarchyid::GetRoot()),
('Design Software', hierarchyid::GetRoot());

INSERT INTO Software (SoftwareName, VendorID, CategoryID) VALUES
('Windows 11', 1, 1),
('MS Office', 1, 2),
('Photoshop', 2, 4),
('IntelliJ IDEA', 4, 3),
('Oracle DB', 3, 3);

INSERT INTO Licenses 
(SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount) VALUES
(1, 1, '2025-01-10', '2026-01-10', 120, 10),
(2, 1, '2025-02-15', '2026-02-15', 80, 15),
(3, 2, '2025-03-01', '2025-12-01', 200, 5),
(4, 3, '2025-04-10', '2026-04-10', 150, 7),
(5, 3, '2025-05-20', '2026-05-20', 300, 3),
(1, 4, '2025-06-01', '2026-06-01', 120, 8),
(2, 5, '2025-07-15', '2026-07-15', 80, 12),
(3, 2, '2025-08-01', '2026-08-01', 200, 6);


INSERT INTO Licenses 
(SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount) VALUES
(1, 2, '2025-01-20', '2026-01-20', 120, 5),
(1, 3, '2025-03-10', '2026-03-10', 120, 6),
(1, 1, '2025-04-05', '2026-04-05', 120, 4),
(1, 4, '2025-09-12', '2026-09-12', 120, 9),
(1, 5, '2025-12-01', '2026-12-01', 120, 3),
(1, 1, '2026-02-14', '2027-02-14', 130, 10),
(1, 2, '2026-07-01', '2027-07-01', 130, 7);


INSERT INTO Licenses 
(SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount) VALUES

(2, 3, '2025-09-01', '2026-09-01', 80, 10),
(3, 4, '2025-10-10', '2026-10-10', 200, 4),
(4, 5, '2025-11-11', '2026-11-11', 150, 6);
