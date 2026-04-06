SELECT 
    s.SoftwareName,
    YEAR(l.PurchaseDate) AS Year,
    MONTH(l.PurchaseDate) AS Month,
    DATEPART(QUARTER, l.PurchaseDate) AS Quarter,
    CASE 
        WHEN MONTH(l.PurchaseDate) <= 6 THEN 1 ELSE 2 
    END AS HalfYear,
    SUM(l.Price * l.LicenseCount) AS TotalCost
FROM Licenses l
JOIN Software s ON l.SoftwareID = s.SoftwareID
WHERE s.SoftwareName = 'Windows 11'
GROUP BY 
    s.SoftwareName,
    YEAR(l.PurchaseDate),
    MONTH(l.PurchaseDate),
    DATEPART(QUARTER, l.PurchaseDate),
    CASE WHEN MONTH(l.PurchaseDate) <= 6 THEN 1 ELSE 2 END;




-- Статистика за период
SELECT 
    s.SoftwareName,
    SUM(l.LicenseCount) AS LicenseCount,
    SUM(l.Price * l.LicenseCount) AS TotalCost,

    100.0 * SUM(l.LicenseCount) / SUM(SUM(l.LicenseCount)) OVER() AS PercentCount,
    100.0 * SUM(l.Price * l.LicenseCount) / SUM(SUM(l.Price * l.LicenseCount)) OVER() AS PercentCost

FROM Licenses l
JOIN Software s ON l.SoftwareID = s.SoftwareID
WHERE l.PurchaseDate BETWEEN '2025-01-01' AND '2025-12-31'
GROUP BY s.SoftwareName;


-- Пагинация
WITH Numbered AS (
    SELECT 
        l.*, 
        ROW_NUMBER() OVER (ORDER BY LicenseID) AS RowNum
    FROM Licenses l
)
SELECT *
FROM Numbered
WHERE RowNum BETWEEN 1 AND 20;

INSERT INTO Licenses 
(SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount)
VALUES
(1, 1, '2025-01-10', '2026-01-10', 120, 10), -- уже есть
(1, 1, '2025-01-10', '2026-01-10', 150, 5),  -- дубликат
(1, 1, '2025-01-10', '2026-01-10', 200, 7);  -- ещё один дубликат


-- Удаление дубликатов
WITH Duplicates AS (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY SoftwareID, RoomID, PurchaseDate
               ORDER BY LicenseID
           ) AS rn
    FROM Licenses
)
DELETE FROM Duplicates WHERE rn > 1;


--Затраты по вендорам за 6 месяцев помесячно
SELECT 
    v.VendorName,
    YEAR(l.PurchaseDate) AS Year,
    MONTH(l.PurchaseDate) AS Month,
    SUM(l.Price * l.LicenseCount) AS TotalCost
FROM Licenses l
JOIN Software s ON l.SoftwareID = s.SoftwareID
JOIN Vendors v ON s.VendorID = v.VendorID
WHERE l.PurchaseDate >= DATEADD(MONTH, -6, GETDATE())
GROUP BY 
    v.VendorName,
    YEAR(l.PurchaseDate),
    MONTH(l.PurchaseDate)
ORDER BY v.VendorName, Year, Month;




-- Самый используемый тип по по типу устройств
WITH UsageStats AS (
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
SELECT *
FROM UsageStats
WHERE rn = 1;