delete from SoftwareCategories where CategoryId > 1;

INSERT INTO SoftwareCategories (CategoryName, Hierarchy)
VALUES ('Software', hierarchyid::GetRoot());

DECLARE @node hierarchyid = hierarchyid::Parse('/');
EXEC GetDescendants @node;



DECLARE @root hierarchyid = hierarchyid::GetRoot();
EXEC AddChildNode @root, 'Office';
EXEC AddChildNode @root, 'Development';
EXEC AddChildNode @root, 'Games';

DECLARE @office hierarchyid = (SELECT Hierarchy FROM SoftwareCategories WHERE CategoryName = 'Office');
DECLARE @development hierarchyid = (SELECT Hierarchy FROM SoftwareCategories WHERE CategoryName = 'Development');
DECLARE @games hierarchyid = (SELECT Hierarchy FROM SoftwareCategories WHERE CategoryName = 'Games');
EXEC AddChildNode @office, 'Word';
EXEC AddChildNode @office, 'Excel';
EXEC AddChildNode @office, 'PowerPoint';

EXEC AddChildNode @development, 'Visual Studio';
EXEC AddChildNode @development, 'VS Code';
EXEC AddChildNode @development, 'Git';

EXEC AddChildNode @games, 'Action';
EXEC AddChildNode @games, 'Strategy';


DECLARE @action hierarchyid = (SELECT Hierarchy FROM SoftwareCategories WHERE CategoryName = 'Action');
DECLARE @strategy hierarchyid = (SELECT Hierarchy FROM SoftwareCategories WHERE CategoryName = 'Strategy');
EXEC AddChildNode @action, 'Shooter';
EXEC AddChildNode @action, 'Platformer';

EXEC AddChildNode @strategy, 'RTS';
EXEC AddChildNode @strategy, 'Turn-Based';




DECLARE @node hierarchyid = hierarchyid::Parse('/');
EXEC GetDescendants @node;


DECLARE @oldParent hierarchyid;
DECLARE @newParent hierarchyid;

SELECT @oldParent = Hierarchy
FROM SoftwareCategories
WHERE CategoryName = 'Action';

SELECT @newParent = Hierarchy
FROM SoftwareCategories
WHERE CategoryName = 'Office';

EXEC MoveSubtree @oldParent, @newParent;




DECLARE @node hierarchyid = hierarchyid::Parse('/');
EXEC GetDescendants @node;