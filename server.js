const http = require('http');
const { read, save } = require('./fileHandler');

const PORT = 5000;
const FILE = './data.json';
const PROPERTIES = {
    completion: "boolean",
    id: "number",
    taskName: "string"
};

init();

async function init() {
    const tasks = await read(FILE);
    
    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS, POST, PUT");
        res.setHeader("Access-Control-Allow-Headers",
            "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
        );
        console.log(`Received request to ${req.url} with method ${req.method}`);
    
        const path = req.url.split('/').filter(item => item !== '');
        // All the request URL has to begin with 'todos'
        if (path[0] !== 'todos') {
            res.statusCode = 404;
            res.end('Unknown path.');
            return;
        }
    
        const method = req.method;
        const targetId = Number(path[1]);
        const targetIndex = path.length === 2 ?
            tasks.findIndex(task => task.id === targetId) :
            null;
        if (method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
        } else if (method === 'GET') {
            let requestedData;
            
            if (path.length === 1) {
                requestedData = tasks;
            } else if (path.length === 2) {
                if (targetIndex < 0) {
                    res.statusCode = 404;
                    res.end(`Data with ID[${targetId}] doesn't exist.`);
                    return;
                }
                requestedData = tasks[targetIndex];
            } else {
                res.statusCode = 400;
                res.end(`Unknown endpoint for ${method} request.`);
                return;
            }

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(requestedData));
            return;

        } else if (method === 'DELETE') {
            if(path.length !== 2) {
                res.statusCode = 400;
                res.end(`Unknown endpoint for ${method} request.`);
                return;
            }
            if (targetIndex < 0) {
                res.statusCode = 404;
                res.end(`Data with ID[${targetId}] doesn't exist.`);
                return;
            }

            tasks.splice(targetIndex, 1);
            save(FILE, tasks);
            res.statusCode = 204;
            res.end();
            return;

        } else {

            let data;
            req.on('data', (chunk) => {
                if (method !== 'POST' && targetIndex < 0) {
                    res.statusCode = 404;
                    res.end(`Data with ID[${targetId}] doesn't exist.`);
                    return;
                }
                // Checking data type
                try {
                    data = JSON.parse(chunk);
                } catch (e) {
                    res.statusCode = 415;
                    res.end("Received wrong type of data. Expected JSON.");
                    return;
                }

                if(!isValid(data, method, targetId)) {
                    res.statusCode = 400;
                    res.end(
                        `Received data has wrong structure. Check if data has correct properties.`
                    );
                    return;
                }

                if (method === 'POST') {
                    if (path.length !== 1) {
                        res.statusCode = 400;
                        res.end(`Unknown endpoint. ${method} doesn't take a parameter.`);
                        return;
                    }
                    const newTask = {};
                    newTask.taskName = data.taskName;
                    newTask.id = generateId();
                    newTask.completion = data.completion;
                    tasks.push(newTask);

                    save(FILE, tasks);

                    res.statusCode = 201;
                    res.end(JSON.stringify(newTask));

                } else if (method === 'PUT' || method === 'PATCH') {
                    if(path.length !== 2) {
                        res.statusCode = 400;
                        res.end(`Wrong path for the ${method} request.`);
                        return;
                    }
                    if (targetIndex < 0) {
                        res.statusCode = 404;
                        res.end(`Data with ID[${targetId}] doesn't exist.`);
                        return;
                    }

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

                    save(FILE, tasks);

                    res.statusCode = 200;
                    res.end(JSON.stringify(tasks[targetIndex]));
                }
            });
            req.on('end', () => {
                if (!data) {
                    res.statusCode = 400;
                    res.end("The request doesn't have data. Body is empty.");
                }
            });
        }
    });

    server.listen(PORT, () => {
        console.log(`The server runs on ${PORT}`)
    });
}

function isValid(data, method, srcID) {
    const keys = Object.keys(data);
    
    const hasCorrectTypes = keys.every(key => typeof data[key] === PROPERTIES[key]);
    const hasRequiredProps = keys.every(key => Object.keys(PROPERTIES).includes(key));
    if (method === 'POST') {
        
        // On POST request, ID will be generated by the server
        return (
            hasRequiredProps &&
            hasCorrectTypes &&
            Object.keys(PROPERTIES).length - 1 === keys.length &&
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
        Object.keys(PROPERTIES).length === keys.length &&
        data.id === srcID
    );
}

function generateId() {
    return Number(
        Date.now().toString() + parseInt(Math.random() * 10000)
    );
}