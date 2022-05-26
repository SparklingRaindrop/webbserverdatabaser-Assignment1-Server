const fs = require('fs/promises');
const { existsSync } = require('fs');

module.exports.read = async function read(file) {
    if (!existsSync(file)) {
        console.log('Creating a new save file');
        await fs.writeFile(file, JSON.stringify([]));
        console.log('Created a new save file');
    }
    try {
        const rawData = await fs.readFile(file);
        const result = JSON.parse(rawData);
        console.log('Read file completed');
        return result;
    } catch (e) {
        console.log('Could not read the data: ', e.message);
    }
}

module.exports.save = async function save(res, file, tasks) {
    try {
        await fs.writeFile(file, JSON.stringify(tasks));
        console.log('Save completed');
    } catch (e) {
        console.log('Could not save the data: ', e.message);
        res.statusCode = 500;
        res.end('The server encountered a problem.');
    }
}