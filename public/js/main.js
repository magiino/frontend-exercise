// Variables
var ID = 0;
var httpClient = new HttpClient();


// Events
window.onload = function () {
    httpClient.FetchTasks(FetchTasks);
};

function TaskDone(event) {
    if(!event.srcElement.classList.contains('taskDone')){
        event.srcElement.classList.add('taskDone');
        document.getElementById('p' + event.srcElement.parentElement.id).style.visibility = 'visible'
    } else {
        event.srcElement.classList.remove('taskDone');
        document.getElementById('p' + event.srcElement.parentElement.id).style.visibility = 'hidden'
    }
}

function TaskDelete(event) {
    httpClient.DeleteTask(event.srcElement.parentElement.id, (success) => {
        if(success != null){
            document.getElementById(success).remove();
        }
    });
}

// Functions
function FetchTasks(tasks){
    document.getElementById('items').innerHTML = '';
    for (let taskId in tasks) {
        ID = taskId;
        addTask(taskId,tasks);
    }
}

function addTask(taskId, tasks) {
    // Left side of item
    // Div
    let task = document.createElement('div');
    task.className = 'task';
    task.setAttribute('id', 'task'+tasks[taskId].id);
    task.addEventListener("click", TaskDone);
    // Span
    let span = document.createElement('span');
    span.setAttribute('id', "p"+tasks[taskId].id);
    span.className = 'taskText';
    span.style.visibility = 'hidden';
    span.innerHTML = 'Done';
    // Text
    let txt = document.createElement('p');
    txt.className = 'taskText';
    txt.innerHTML = tasks[taskId].text;

    task.appendChild(span);
    task.appendChild(txt);

    // Right side of item
    // Button
    let btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btnDel';
    btnDel.textContent = 'X';
    btnDel.addEventListener("click", TaskDelete);

    // Item div
    let item = document.createElement('div');
    item.className = 'item';
    item.setAttribute('id', tasks[taskId].id);

    item.appendChild(task);
    item.appendChild(btnDel);

    document.getElementById('items').appendChild(item);
}

function AddNewTask(){
    let newTask = document.getElementById("newTask").value;
    if (newTask === ''){
        alert('You can not add empty task!');
        return;
    }

    httpClient.PostTask(newTask, (success) => {
        if(success != null) {
            addTask(0, [{"id": ID, "text": newTask}]);
        }
    });
}

function fetch(){
    httpClient.FetchTasks(FetchTasks);
}

// Http Client object
function HttpClient() {
    let httpRequest = new XMLHttpRequest();

    this.FetchTasks = function(callback) {
        httpRequest.open("GET", "http://localhost:3000/api/tasks", true);
        httpRequest.onreadystatechange = function () {
            if (httpRequest.status === 200 && httpRequest.readyState === 4) {
                callback(JSON.parse(httpRequest.response));
            } else if (httpRequest.status > 400 && httpRequest.readyState === 4) {
                console.log('Data Fetch Failed with Status Code - ' + httpRequest.status);
                callback(null);
            }
        };
        httpRequest.send();
    };

    this.UpdateTask = function(id, data){
        httpRequest.open("PUT", "http://localhost:3000/api/tasks/" + id, true);
        httpRequest.setRequestHeader('Content-Type', 'application/json');
        httpRequest.send(data);
    };

    this.DeleteTask = function(id, callback){
        httpRequest.open("DELETE", "http://localhost:3000/api/tasks/" + id, true);

        httpRequest.onreadystatechange = function () {
            if (httpRequest.status === 204 && httpRequest.readyState === 4) {
                callback(id);
            } else if (httpRequest.status > 400 && httpRequest.readyState === 4) {
                console.log('Delete Data Failed with Status Code - ' + httpRequest.status);
                callback(null);
            }
        };

        httpRequest.send(null);
    };

    this.PostTask = function(task, callback){
        httpRequest.open("POST", "http://localhost:3000/api/tasks", true);
        httpRequest.setRequestHeader('Content-Type', 'application/json');

        httpRequest.onreadystatechange = function () {
            if (httpRequest.status === 204 && httpRequest.readyState === 4) {
                callback(ID);
            } else if (httpRequest.status > 400 && httpRequest.readyState === 4) {
                console.log('Delete Data Failed with Status Code - ' + httpRequest.status);
                callback(null);
            }
        };
        httpRequest.send(JSON.stringify({"id":++ID, "text":task}));
    }
}