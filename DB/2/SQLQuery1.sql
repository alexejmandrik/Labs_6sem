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


drop table DeviceType;
drop table Rooms;
drop table Vendors
drop table SoftwareCategories
drop table Software
drop table Licenses






CREATE VIEW LicenseInfo AS
SELECT l.LicenseID, s.SoftwareName, v.VendorName, r.RoomName, dt.DeviceTypeName,
    l.PurchaseDate, l.ExpirationDate, l.Price, l.LicenseCount
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
        SELECT 1 FROM inserted i WHERE i.ExpirationDate < i.PurchaseDate
    )
    BEGIN
        RAISERROR('Дата окончания лицензии не может быть меньше даты покупки', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;


CREATE INDEX LicensesSoftwareID ON Licenses(SoftwareID);



CREATE FUNCTION EndingLicensesCount (@Days INT)
RETURNS INT
AS
BEGIN
    DECLARE @Count INT;
    SELECT @Count = COUNT(*) FROM Licenses WHERE ExpirationDate >= GETDATE() AND ExpirationDate <= DATEADD(DAY, @Days, GETDATE());
    RETURN @Count;
END


CREATE FUNCTION LicenseCostByRoom (@RoomID INT)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @Total DECIMAL(12,2);
    SELECT @Total = SUM(Price * LicenseCount) FROM Licenses WHERE RoomID = @RoomID;
    RETURN ISNULL(@Total,0);
END

CREATE FUNCTION VendorSoftwareCount (@VendorID INT)
RETURNS INT
AS
BEGIN
    DECLARE @Count INT;
    SELECT @Count = COUNT(*) FROM Software WHERE VendorID = @VendorID;
    RETURN @Count;
END

CREATE FUNCTION IsLicenseActive (@LicenseID INT)
RETURNS BIT
AS
BEGIN
    DECLARE @Result BIT;
    IF EXISTS (SELECT 1 FROM Licenses WHERE LicenseID = @LicenseID AND ExpirationDate >= GETDATE())
        SET @Result = 1;
    ELSE
        SET @Result = 0;
    RETURN @Result;
END

CREATE FUNCTION AvgLicenseCount (@SoftwareID INT)
RETURNS FLOAT
AS
BEGIN
    DECLARE @Avg FLOAT;
    SELECT @Avg = AVG(LicenseCount) FROM Licenses WHERE SoftwareID = @SoftwareID;
    RETURN ISNULL(@Avg,0);
END







CREATE PROCEDURE GetLicensesBySoftware
    @SoftwareName NVARCHAR(150)
AS
BEGIN
    SELECT * FROM LicenseInfo WHERE SoftwareName = @SoftwareName;
END;

CREATE PROCEDURE ExtendLicense
    @LicenseID INT,
    @Days INT
AS
BEGIN
    UPDATE Licenses SET ExpirationDate = DATEADD(DAY, @Days, ExpirationDate) WHERE LicenseID = @LicenseID;
END;


CREATE PROCEDURE GetExpiredLicenses
AS
BEGIN
    SELECT * FROM LicenseInfo WHERE ExpirationDate < GETDATE();
END;



CREATE PROCEDURE RoomLicensesCount
AS
BEGIN
    SELECT 
        r.RoomName,
        ISNULL(SUM(l.LicenseCount), 0) AS TotalLicenses
    FROM Rooms r
    LEFT JOIN Licenses l ON r.RoomID = l.RoomID
    GROUP BY r.RoomName
    ORDER BY TotalLicenses DESC;
END;


CREATE PROCEDURE RoomLicenseReport
    @RoomID INT
AS
BEGIN
    SELECT r.RoomName, s.SoftwareName, l.LicenseCount, l.Price,  l.ExpirationDate
    FROM Licenses l
    JOIN Software s ON l.SoftwareID = s.SoftwareID
    JOIN Rooms r ON l.RoomID = r.RoomID WHERE r.RoomID = @RoomID;
END;

