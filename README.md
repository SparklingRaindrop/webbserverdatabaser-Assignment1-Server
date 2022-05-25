# To-do list API
- Written in vanilla Node.js and can only be run locally.  
- Can only be accessed from **http://localhost:3000**  
- If you want to use it from another port, change it in the header setting.  
`res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');`

## **How to use it**
You need [Node.js](https://nodejs.org/en/) in order to run this app.  
  
To run server, write in terminal
```
node server.js
```
Then server will run on http://localhost:5000/  
If you want to run on another port, change the port number.  
`const PORT = 5000;`

---
  
### **<mark>GET</mark> /todos/:id**
Calling API without an ID will return a list of all the saved tasks.

| Name      | Description | Type   |
| ----------- | ----------- | ----- |
| taskName  | Task name | string
| id | ID of the task  | number
| completion | Task Completion Status | boolean

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

---

### **<mark>POST</mark> /todos/**
Adding a new task to the database.

| Name      | Description | Type   |
| ----------- | ----------- | ----- |
| taskName  | Task name | string
| completion | Task Completion Status | boolean

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

---

### **<mark>PATCH or PUT</mark>  /todos/:ID**
Updating a task on the database. ID is immutable.

| Name      | Description | Type   |
| ----------- | ----------- | ----- |
| taskName  | Task name | string |
| id | ID of the task  | number |
| completion | Task Completion Status | boolean |

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

---

### **<mark>DELETE</mark> /todos/:ID**
Deleting a task on the database.

| Name      | Description | Type   |
| ----------- | ----------- | ----- |
| id | ID of the task  | number |

```javascript
fetch('http://localhost:5000/todos/16528656609342060', {
    method: 'DELETE'
});
```