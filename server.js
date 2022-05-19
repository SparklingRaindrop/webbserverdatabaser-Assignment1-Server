const http = require('http');
const fs = require('fs/promises');
const { existsSync } = require('fs');

const PORT = 5000;
const file = './data.json';
let tasks;

init();

async function init() {
    tasks = await read(file);
    
    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS, POST, PUT");
        res.setHeader("Access-Control-Allow-Headers",
            "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
        );
        console.log(`Received request to ${req.url} with method ${req.method}`);
    
        const directory = req.url.split('/').filter(item => item !== '');
        // All the request URL has to begin with 'todos'
        if (directory[0] !== 'todos') {
            res.statusCode = 404;
            res.end();
            return;
        }
    
        const method = req.method;
        const targetId = Number(directory[1]);
        const targetIndex = tasks.findIndex(task => task.id === targetId);
        switch (method) {
            case 'OPTIONS':
                res.statusCode = 200;
                res.end();
            break;
            case 'GET':
                if (directory.length === 1) {
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    res.end(JSON.stringify(tasks));
                } else if (directory.length === 2) {
                    if (targetIndex > -1) {
                        res.writeHead(200, {
                            'Content-Type': 'application/json'
                        });
                        res.end(JSON.stringify(tasks[targetIndex]));
                    } else {
                        // There is no data with the provided ID 
                        res.statusCode = 404;
                        res.end();
                    }
                }
            break;
            case 'POST':
                if (directory.length === 1) {
                    req.on('data', (chunk) => {
                        const data = JSON.parse(chunk);
                        if(isValid(data)) {
                            const newTask = {};
                            newTask.taskName = data.taskName;
                            newTask.id = Number(Date.now().toString() + parseInt(Math.random() * 10000));
                            newTask.completion = data.completion;
                            tasks.push(newTask);
    
                            save();
    
                            res.setHeader('Location', `/todos/${newTask.id}`);
                            res.statusCode = 201;
                            res.end();
                        } else {
                            // Data is not valid
                            res.statusCode = 400;
                            res.end();
                        }
                    });
                } else {
                    // Wrong directory or no data with the method "POST"
                    res.statusCode = 400;
                    res.end();
                }
            break;
            case 'PUT':
            case 'PATCH':
                if(directory.length !== 2) {
                    // Wrong directory or no data with the method "PUT" & "PATCH"
                    res.statusCode = 400;
                    res.end();
                    return;
                }
                if (targetIndex > -1) {
                    req.on('data', (chunk) => {
                        const data = JSON.parse(chunk);
                        if(isValid(data, method)) {
                            if (method === 'PUT') {
                                const newData = {
                                    taskName: data.taskName,
                                    id: targetId, // TODO: MAKE sure this
                                    completion: data.completion,
                                };
                                tasks[targetIndex] = newData;
                            } else {
                                tasks[targetIndex] = {
                                    ...tasks[targetIndex],
                                    ...data,
                                }
                            }
    
                            save();
    
                            res.statusCode = 204;
                            res.end();
                        } else {
                            // Data isn't valid
                            res.statusCode = 400;
                            res.end();
                        }
                    });
                } else {
                    // There is no such data with the provided ID 
                    res.statusCode = 404;
                    res.end();
                }
            break;
            case 'DELETE':
                if (targetIndex > -1) {
                    tasks.splice(targetIndex, 1);
    
                    save();
    
                    res.statusCode = 204;
                    res.end();
                } else {
                    // There is no such data with the provided ID 
                    res.statusCode = 404;
                    res.end();
                }
            break;
        }
    });

    server.listen(PORT, () => {
        console.log(`The server runs on ${PORT}`)
    });
}

function isValid(data, method = 'PUT') {
    const properties = {
        completion: "boolean",
        taskName: "string"
    };
    const keys = Object.keys(data);
    
    const hasCorrectTypes = keys.every(key => typeof data[key] === properties[key]);
    const hasRequiredProps = keys.every(key => Object.keys(properties).includes(key));
    if (method === 'PATCH') {
        return hasRequiredProps && hasCorrectTypes;
    }
  	return hasRequiredProps && hasCorrectTypes && Object.keys(properties).length === keys.length;
}

async function read() {
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
        console.log(e.message);
    }
}

async function save() {
    try {
        await fs.writeFile(file, JSON.stringify(tasks));
        console.log('Save completed');
    } catch (e) {
        console.log(e.message);
    }
}