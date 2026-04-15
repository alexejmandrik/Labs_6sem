alter session set container = XEPDB1;

SELECT 
    s.SoftwareName,
    EXTRACT(YEAR FROM l.PurchaseDate) AS Year,
    EXTRACT(MONTH FROM l.PurchaseDate) AS Month,
    TO_NUMBER(TO_CHAR(l.PurchaseDate, 'Q')) AS Quarter,
    CASE 
        WHEN EXTRACT(MONTH FROM l.PurchaseDate) <= 6 THEN 1 ELSE 2 
    END AS HalfYear,
    SUM(l.Price * l.LicenseCount) AS TotalCost
FROM Licenses l
JOIN Software s ON l.SoftwareID = s.SoftwareID
WHERE s.SoftwareName = 'Windows 11'
GROUP BY ROLLUP (
    s.SoftwareName,
    EXTRACT(YEAR FROM l.PurchaseDate),
    EXTRACT(MONTH FROM l.PurchaseDate),
    TO_NUMBER(TO_CHAR(l.PurchaseDate, 'Q')),
    CASE WHEN EXTRACT(MONTH FROM l.PurchaseDate) <= 6 THEN 1 ELSE 2 END
);
    
    
    


SELECT 
    s.SoftwareName,
    SUM(l.LicenseCount) AS LicenseCount,
    SUM(l.Price * l.LicenseCount) AS TotalCost,

    100 * SUM(l.LicenseCount) / SUM(SUM(l.LicenseCount)) OVER() AS PercentCount,
    100 * SUM(l.Price * l.LicenseCount) / SUM(SUM(l.Price * l.LicenseCount)) OVER() AS PercentCost

FROM Licenses l
JOIN Software s ON l.SoftwareID = s.SoftwareID
WHERE l.PurchaseDate BETWEEN DATE '2025-01-01' AND DATE '2025-12-31'
GROUP BY s.SoftwareName;




SELECT 
    v.VendorName,
    EXTRACT(YEAR FROM l.PurchaseDate) AS Year,
    EXTRACT(MONTH FROM l.PurchaseDate) AS Month,
    SUM(l.Price * l.LicenseCount) AS TotalCost
FROM Licenses l
JOIN Software s ON l.SoftwareID = s.SoftwareID
JOIN Vendors v ON s.VendorID = v.VendorID
WHERE l.PurchaseDate >= ADD_MONTHS(SYSDATE, -6)
GROUP BY 
    v.VendorName,
    EXTRACT(YEAR FROM l.PurchaseDate),
    EXTRACT(MONTH FROM l.PurchaseDate)
ORDER BY v.VendorName;



select * from Licenses

SELECT DeviceTypeName, CategoryName, UsageCount
FROM (
    SELECT 
        dt.DeviceTypeName,
        sc.CategoryName,
        COUNT(*) AS UsageCount,
        ROW_NUMBER() OVER (
            PARTITION BY dt.DeviceTypeName
            ORDER BY COUNT(*) DESC
        ) AS rn
    FROM Licenses l
    JOIN Rooms r ON l.RoomID = r.RoomID
    JOIN DeviceType dt ON r.DeviceTypeID = dt.DeviceTypeID
    JOIN Software s ON l.SoftwareID = s.SoftwareID
    JOIN SoftwareCategories sc ON s.CategoryID = sc.CategoryID
    GROUP BY dt.DeviceTypeName, sc.CategoryName
)
WHERE rn = 1;