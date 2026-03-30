const fs = require('fs');

fs.readFile('input.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Ошибка чтения файла:', err);
        return;
    }

    const totalChars = data.length;

    const charsWithoutSpaces = data.replace(/\s/g, '').length;

    console.log('Всего символов:', totalChars);
    console.log('Без пробелов:', charsWithoutSpaces);
});