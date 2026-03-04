create database DB_SQL;


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
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE,
    ParentCategoryID INT NULL,
    CONSTRAINT FK_SoftwareCategories_Parent FOREIGN KEY (ParentCategoryID)
        REFERENCES SoftwareCategories(CategoryID)
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








CREATE VIEW LicenseInfo AS
SELECT 
    l.LicenseID,
    s.SoftwareName,
    v.VendorName,
    r.RoomName,
    dt.DeviceTypeName,
    l.PurchaseDate,
    l.ExpirationDate,
    l.Price,
    l.LicenseCount
FROM Licenses l
JOIN Software s ON l.SoftwareID = s.SoftwareID
JOIN Vendors v ON s.VendorID = v.VendorID
JOIN Rooms r ON l.RoomID = r.RoomID
JOIN DeviceType dt ON r.DeviceTypeID = dt.DeviceTypeID;





CREATE TRIGGER CheckLicenseDates
ON Licenses
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE i.ExpirationDate < i.PurchaseDate
    )
    BEGIN
        RAISERROR('Дата окончания лицензии не может быть меньше даты покупки', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;





CREATE PROCEDURE sp_AddLicense
    @SoftwareID INT,
    @RoomID INT,
    @PurchaseDate DATE,
    @ExpirationDate DATE,
    @Price DECIMAL(10,2),
    @LicenseCount INT
AS
BEGIN
    IF @ExpirationDate < @PurchaseDate
    BEGIN
        RAISERROR('Дата окончания не может быть меньше даты покупки', 16, 1);
        RETURN;
    END

    INSERT INTO Licenses(SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount)
    VALUES (@SoftwareID, @RoomID, @PurchaseDate, @ExpirationDate, @Price, @LicenseCount);
END;





CREATE PROCEDURE sp_GetLicensesByVendor
    @VendorID INT
AS
BEGIN
    SELECT *
    FROM VW_LicenseInfo
    WHERE VendorName = (SELECT VendorName FROM Vendors WHERE VendorID = @VendorID);
END;






CREATE INDEX LicensesSoftwareID ON Licenses(SoftwareID);
