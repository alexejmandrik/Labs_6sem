alter session set container = XEPDB1;
-- Спецификация типа
CREATE OR REPLACE TYPE License_OBJ AS OBJECT (
    LicenseID NUMBER,
    SoftwareID NUMBER,
    RoomID NUMBER,
    PurchaseDate DATE,
    ExpirationDate DATE,
    Price NUMBER,
    LicenseCount NUMBER,

    -- Дополнительный конструктор
    CONSTRUCTOR FUNCTION License_OBJ(p_id NUMBER, p_price NUMBER) RETURN SELF AS RESULT,

    -- Функция как метод экземпляра
    MEMBER FUNCTION TotalCost RETURN NUMBER,

    -- Процедура как метод экземпляра
    MEMBER PROCEDURE UpdatePrice(p_new_price NUMBER),

    -- Метод сравнения (MAP)
    MAP MEMBER FUNCTION GetCost RETURN NUMBER DETERMINISTIC
);
/

-- Тело типа (реализация методов)
CREATE OR REPLACE TYPE BODY License_OBJ AS
    CONSTRUCTOR FUNCTION License_OBJ(p_id NUMBER, p_price NUMBER) RETURN SELF AS RESULT IS
    BEGIN
        SELF.LicenseID := p_id;
        SELF.Price := p_price;
        SELF.PurchaseDate := SYSDATE;
        SELF.LicenseCount := 1; -- значение по умолчанию
        RETURN;
    END;

    MEMBER FUNCTION TotalCost RETURN NUMBER IS
    BEGIN
        RETURN SELF.Price * NVL(SELF.LicenseCount, 1);
    END;

    MEMBER PROCEDURE UpdatePrice(p_new_price NUMBER) IS
    BEGIN
        SELF.Price := p_new_price;
    END;

    MAP MEMBER FUNCTION GetCost RETURN NUMBER DETERMINISTIC IS
    BEGIN
        -- Для сравнения объектов будем использовать общую стоимость
        RETURN SELF.TotalCost();
    END;
END;
/


CREATE TABLE License_OBJ_Table OF License_OBJ;

-- Копирование данных через конструктор по умолчанию
INSERT INTO License_OBJ_Table
SELECT License_OBJ(LicenseID, SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount)
FROM Licenses;

CREATE OR REPLACE VIEW License_View AS
SELECT License_OBJ(LicenseID, SoftwareID, RoomID, PurchaseDate, ExpirationDate, Price, LicenseCount) AS License
FROM Licenses;

-- Пример использования представления
SELECT l.License.LicenseID, l.License.TotalCost()
FROM License_View l;



-- 1. Индекс по атрибуту
CREATE INDEX idx_license_price ON License_OBJ_Table (Price);

-- 2. Индекс по методу (функциональный индекс)
-- В Oracle для объектных таблиц мы вызываем метод прямо у столбца
CREATE INDEX idx_license_cost ON License_OBJ_Table t (t.GetCost());


-- Сортировка (использует MAP метод GetCost)
SELECT *
FROM License_OBJ_Table t
ORDER BY VALUE(t);

-- Вызов процедур и функций в PL/SQL блоке
DECLARE
    l License_OBJ;
BEGIN
    SELECT VALUE(t) INTO l FROM License_OBJ_Table t WHERE LicenseID = 1;
    l.UpdatePrice(1200);
    UPDATE License_OBJ_Table t SET t = l WHERE t.LicenseID = 1;
    DBMS_OUTPUT.PUT_LINE('Новая стоимость: ' || l.TotalCost());
END;
/


-- 1. Удаляем представление
DROP VIEW License_View;

-- 2. Удаляем индекс по цене
DROP INDEX idx_license_price;

-- 3. (если вдруг индекс на функцию создался частично — пробуем удалить)
DROP INDEX idx_license_cost;

-- 4. Удаляем таблицу объектов
DROP TABLE License_OBJ_Table;

-- 5. Удаляем тип (с телом)
DROP TYPE License_OBJ FORCE;


