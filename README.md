# To-do list API
- It is written in vanilla Node.js and can only run locally.  
- It only allows access from **http://localhost:3000**.  
- If you want to use it from another server, change the header setting.  
`res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');`
  
## Resource
There is only one resource in To-do list API.
- http://localhost:5000/todos
  
## How to use it
- You need [Node.js](https://nodejs.org/en/) in order to run this app.  
  
To run server (in terminal)
```
node server.js
```
Then server will run on http://localhost:5000/

**Get all the tasks**
```javascript
fetch('http://localhost:5000/todos')
    .then(res=>res.json())
    .then(json=>console.log(json));
```
**Result**
```json
[
    {
        "taskName": "Return a book",
        "id": 16528655947419444,
        "completion": false
    },
    {
        "taskName": "Pick up a package",
        "id": 16528656609342060,
        "completion": false
    },
    {
        "taskName": "Buy milk",
        "id": 16528656744504664,
        "completion": false
    }
]
```

**Get a single task**
```javascript
fetch('http://localhost:5000/todos/16528656609342060')
    .then(res=>res.json())
    .then(json=>console.log(json));
```
**Result**
```json
{
    "taskName": "Pick up a package",
    "id": 16528656609342060,
    "completion": false
}
```

**Add a new task**
```javascript
fetch('http://localhost:5000/todos/', {
    method: 'POST',
    body: JSON.stringify(
        {
            taskName: 'test task',
            completion: false,
        }
    ),
    headers: {
        'Content-Type': 'application/json',
    }
});
```
**Result**
```json
{
    "taskName": "test task",
    "id": 16529817896903240,
    "completion": false
}
```
**Update a task**
```javascript
fetch('http://localhost:5000/todos/16528656609342060', {
    method: 'PATCH',
    body: JSON.stringify(
        {
            taskName: 'Pick up a package from Coop',
            id: 16528656609342060,
            completion: false
        }
    ),
    headers: {
        'Content-Type': 'application/json',
    }
});
```

```javascript
fetch('http://localhost:5000/todos/16528656609342060', {
    method: 'PUT',
    body: JSON.stringify(
        {
            taskName: 'Pick up a package from Coop',
            id: 16528656609342060,
            completion: false
        }
    ),
    headers: {
        'Content-Type': 'application/json',
    }
});
```
**Result**
```json
{
    "taskName": "Pick up a package from Coop",
    "id": 16528656609342060,
    "completion": false
}
```
**Delete a task**
```javascript
fetch('http://localhost:5000/todos/16528656609342060', {
    method: 'DELETE'
});
```