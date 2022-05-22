const http = require('http');
const { read, save } = require('./fileHandler');

const PORT = 5000;
const file = './data.json';

init();

async function init() {
    const tasks = await read(file);
    
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
                        res.statusCode = 404;
                        res.end(`Data with ID[${targetId}] doesn't exist.`);
                    }
                }
            break;
            case 'POST':
                if (directory.length === 1) {
                    let data;
                    req.on('data', (chunk) => {

                        try {
                            data = JSON.parse(chunk);
                        } catch (e) {
                            res.statusCode = 400;
                            res.end("Received wrong type of data. Expected JSON.");
                            return;
                        }

                        if(isValid(data, 'POST')) {
                            const newTask = {};
                            newTask.taskName = data.taskName;
                            newTask.id = Number(Date.now().toString() + parseInt(Math.random() * 10000));
                            newTask.completion = data.completion;
                            tasks.push(newTask);
                            save(file, tasks);
    
                            res.statusCode = 201;
                            res.end(JSON.stringify(newTask));
                        } else {
                            res.statusCode = 400;
                            res.end("Received data has wrong structure. Check if data has correct properties.");
                        }
                    });
                    req.on('end', () => {
                        if (!data) {
                            res.statusCode = 400;
                            res.end("The request doesn't have data.");
                        }
                    });
                } else {
                    res.statusCode = 405;
                    res.end(`Wrong endpoint for the ${method} request.`);
                }
            break;
            case 'PUT':
            case 'PATCH':
                if(directory.length !== 2) {
                    res.statusCode = 405;
                    res.end(`Wrong endpoint for the ${method} request.`);
                    return;
                }
                if (targetIndex > -1) {
                    let data;
                    req.on('data', (chunk) => {

                        try {
                            data = JSON.parse(chunk);
                        } catch (e) {
                            res.statusCode = 400;
                            res.end("Received wrong type of data. Expected JSON.");
                            return;
                        }

                        if(isValid(data, method, targetId)) {
                            if (method === 'PUT') {
                                const newData = {
                                    taskName: data.taskName,
                                    id: data.id,
                                    completion: data.completion,
                                };
                                tasks[targetIndex] = newData;
                            } else {
                                tasks[targetIndex] = {
                                    ...tasks[targetIndex],
                                    ...data,
                                }
                            }
    
                            save(file, tasks);
    
                            res.statusCode = 200;
                            res.end(JSON.stringify(tasks[targetIndex]));
                        } else {
                            res.statusCode = 400;
                            res.end("Received data has wrong structure. Check if data has correct properties.");
                        }
                    });
                    req.on('end', () => {
                        if (!data) {
                            res.statusCode = 400;
                            res.end("The request doesn't have data.");
                        }
                    });
                } else {
                    // There is no such data with the provided ID 
                    res.statusCode = 404;
                    res.end(`Data with ID[${targetId}] doesn't exist.`);
                }
            break;
            case 'DELETE':
                if (targetIndex > -1) {
                    tasks.splice(targetIndex, 1);
    
                    save(file, tasks);
    
                    res.statusCode = 204;
                    res.end();
                } else {
                    // There is no such data with the provided ID 
                    res.statusCode = 404;
                    res.end(`Data with ID[${targetId}] doesn't exist.`);
                }
            break;
        }
    });

    server.listen(PORT, () => {
        console.log(`The server runs on ${PORT}`)
    });
}

function isValid(data, method = 'PUT', srcID) {
    const properties = {
        completion: "boolean",
        id: "number",
        taskName: "string"
    };
    const keys = Object.keys(data);
    
    const hasCorrectTypes = keys.every(key => typeof data[key] === properties[key]);
    const hasRequiredProps = keys.every(key => Object.keys(properties).includes(key));
    if (method === 'POST') {
        
        // On POST request, ID will be generated by the server
        return (
            hasRequiredProps &&
            hasCorrectTypes &&
            Object.keys(properties).length - 1 === keys.length &&
            !data.id);

    } else if (method === 'PATCH') {
        
        // ID is immutable 
        if (data.id) {
            return hasRequiredProps && hasCorrectTypes && data.id === srcID;
        }
        return hasRequiredProps && hasCorrectTypes;

    }
    return (
        hasRequiredProps && 
        hasCorrectTypes && 
        Object.keys(properties).length === keys.length &&
        data.id === srcID
    );
}