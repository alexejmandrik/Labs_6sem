Select * from LicenseInfo;
Select * from Rooms;

INSERT INTO Licenses (SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount) VALUES
(1, 1, '2024-01-10', '2023-01-10', 100, 5);

SELECT * FROM Licenses WHERE SoftwareID = 1;

SELECT dbo.EndingLicensesCount(62) AS LicensesEndingSoon;

SELECT dbo.LicenseCostByRoom(1) AS TotalCostRoom1;

SELECT dbo.VendorSoftwareCount(1) AS MicrosoftSoftware;

SELECT dbo.IsLicenseActive(1) AS License1Active;
SELECT dbo.IsLicenseActive(5) AS License3Active;

SELECT dbo.AvgLicenseCount(1) AS AvgWindowsLicenses;
SELECT dbo.AvgLicenseCount(4) AS AvgIntelliJLicenses;


EXEC GetLicensesBySoftware 'Intellij IDEA';

EXEC ExtendLicense 6, 30;
SELECT * FROM Licenses WHERE LicenseID = 6;

EXEC GetExpiredLicenses;

EXEC RoomLicensesCount;

EXEC RoomLicenseReport 1;