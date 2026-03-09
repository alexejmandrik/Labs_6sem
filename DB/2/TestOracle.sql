show con_name;
ALTER SESSION SET CONTAINER = XEPDB1;

INSERT INTO Licenses (SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount)
VALUES (1, 1, DATE '2024-01-10', DATE '2023-01-10', 100, 5);

SELECT * FROM LicenseInfo;

SELECT * FROM Licenses WHERE SoftwareID = 1;


BEGIN
    DBMS_OUTPUT.PUT_LINE('EndingLicensesCount(67)=' || EndingLicensesCount(67));
END;
/

BEGIN
    DBMS_OUTPUT.PUT_LINE('LicenseCostByRoom(1)=' || LicenseCostByRoom(1));
END;
/

BEGIN
    DBMS_OUTPUT.PUT_LINE('VendorSoftwareCount(1)=' || VendorSoftwareCount(1));
END;
/

BEGIN
    DBMS_OUTPUT.PUT_LINE('IsLicenseActive(1)=' || IsLicenseActive(1));
    DBMS_OUTPUT.PUT_LINE('IsLicenseActive(5)=' || IsLicenseActive(5));
END;
/

BEGIN
    DBMS_OUTPUT.PUT_LINE('AvgWindowsLicenses=' || AvgLicenseCount(1));
    DBMS_OUTPUT.PUT_LINE('AvgIntelliJLicenses=' || AvgLicenseCount(4));
END;
/

BEGIN
    GetLicensesBySoftware('IntelliJ IDEA');
END;
/

BEGIN
    ExtendLicense(6, 30);
    FOR r IN (SELECT * FROM Licenses WHERE LicenseID = 6) LOOP
        DBMS_OUTPUT.PUT_LINE('LicenseID=' || r.LicenseID || ', New Expiration=' || r.ExpirationDate);
    END LOOP;
END;
/

BEGIN
    GetExpiredLicenses;
END;
/

BEGIN
    RoomLicensesCount;
END;
/

BEGIN
    RoomLicenseReport(1);
END;
/