alter session set container = XEPDB1;
-- Тип для лицензии (К2)
CREATE OR REPLACE TYPE License_T AS OBJECT (
    LicenseID NUMBER,
    Price NUMBER,
    LicenseCount NUMBER
);
/

-- Коллекция лицензий (К2)
CREATE OR REPLACE TYPE License_Coll AS TABLE OF License_T;
/

-- Добавляем MAP метод в тип Software_T
CREATE OR REPLACE TYPE Software_T AS OBJECT (
    SoftwareID NUMBER,
    SoftwareName NVARCHAR2(150),
    Licenses_List License_Coll,

    MAP MEMBER FUNCTION match RETURN NUMBER
);
/
-- Реализуем метод (сравниваем по ID)
CREATE OR REPLACE TYPE BODY Software_T AS
    MAP MEMBER FUNCTION match RETURN NUMBER IS
    BEGIN
        RETURN SoftwareID;
    END;
END;
/

-- Основная коллекция ПО (К1)
CREATE OR REPLACE TYPE Software_Coll AS TABLE OF Software_T;
/


SET SERVEROUTPUT ON;

DECLARE
    -- Создаем промежуточную коллекцию K1
    k1 Software_Coll;
    
    -- Тип для демонстрации преобразования (только ID и Имя)
    TYPE Simple_Software_Rec IS RECORD (
        id NUMBER,
        name NVARCHAR2(150)
    );
    TYPE Simple_Software_Coll IS TABLE OF Simple_Software_Rec;
    k_simple Simple_Software_Coll;
BEGIN
    -- 1. BULK COLLECT: Загружаем данные из БД в объектную коллекцию
    SELECT Software_T(
        s.SoftwareID, 
        s.SoftwareName,
        CAST(MULTISET(
            SELECT LicenseID, Price, LicenseCount 
            FROM Licenses l 
            WHERE l.SoftwareID = s.SoftwareID
        ) AS License_Coll)
    )
    BULK COLLECT INTO k1
    FROM Software s;

    -- 2. ПРЕОБРАЗОВАНИЕ: Из коллекции объектов в реляционные данные через TABLE()
    -- и одновременно BULK COLLECT в коллекцию другого типа (записи RECORD)
    SELECT SoftwareID, SoftwareName
    BULK COLLECT INTO k_simple
    FROM TABLE(k1)
    WHERE SoftwareName LIKE 'Windows%';

    DBMS_OUTPUT.PUT_LINE('Преобразовано элементов: ' || k_simple.COUNT);

    -- 3. FORALL (BULK операция): Массовое обновление цен лицензий для ПО в коллекции
    -- Предположим, мы хотим проиндексировать цены всех лицензий для ПО из нашего списка k1
    FORALL i IN 1..k1.COUNT
        UPDATE Licenses
        SET Price = Price * 1.05
        WHERE SoftwareID = k1(i).SoftwareID;

    DBMS_OUTPUT.PUT_LINE('Цены лицензий обновлены (FORALL) для ' || k1.COUNT || ' видов ПО');
    
    COMMIT;
END;
/


DECLARE
    -- Тип для простой коллекции (другой вид)
    TYPE Name_List IS TABLE OF NVARCHAR2(150);
    names Name_List;
    
    k1 Software_Coll;
BEGIN
    -- 4. Применение BULK COLLECT
    SELECT Software_T(SoftwareID, SoftwareName, License_Coll())
    BULK COLLECT INTO k1
    FROM Software
    WHERE ROWNUM <= 10;

    -- 3. Преобразование коллекции к коллекции другого типа (извлечение имен)
    SELECT SoftwareName 
    BULK COLLECT INTO names 
    FROM TABLE(k1);
    
    DBMS_OUTPUT.PUT_LINE('Извлечено имен: ' || names.COUNT);

    -- 4. Применение FORALL (массовое обновление цен в исходной таблице)
    -- Допустим, мы хотим поднять цену на 10% для определенных ID
    FORALL i IN 1..k1.COUNT
        UPDATE Licenses
        SET Price = Price * 1.1
        WHERE SoftwareID = k1(i).SoftwareID;
        
    COMMIT;
END;
/


-- 1. Основная коллекция (зависит от Software_T)
DROP TYPE Software_Coll;

-- 2. Тип Software (зависит от License_Coll)
DROP TYPE Software_T;

-- 3. Коллекция лицензий (зависит от License_T)
DROP TYPE License_Coll;

-- 4. Базовый тип лицензии
DROP TYPE License_T;
