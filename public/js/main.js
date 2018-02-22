// Variables
var ID = 0;
var EditMode = 0;
var httpClient = new HttpClient();


// Events
window.onload = function () {
    httpClient.FetchTasks(FetchTasks);
};

function TaskDone(event1) {
    if(EditMode === 0) {
        if (!event1.srcElement.classList.contains('taskDone')) {
            event1.srcElement.classList.add('taskDone');
            document.getElementById('p' + event1.srcElement.parentElement.id).style.display = 'inline-block';
        } else {
            event1.srcElement.classList.remove('taskDone');
            document.getElementById('p' + event1.srcElement.parentElement.id).style.display = 'none';
        }
    }
}

function TaskDelete(event2) {
    if(EditMode === 0) {
        httpClient.DeleteTask(event2.srcElement.parentElement.id, (success) => {
            if (success != null) {
                document.getElementById(success).remove();
            }
        });
    }
}

// Functions
function FetchTasks(tasks){
    document.getElementById('items').innerHTML = '';
    for (let taskId in tasks) {
        ID = taskId;
        addTask(taskId,tasks);
    }
}

function EditTasks(event){
    console.log('EDIIT');
    console.log(event);
    let element = event.srcElement;
    let inputTxt = document.getElementById('input'+element.parentElement.id);

    if(EditMode === 0) {
        EditMode = 1;
        element.innerHTML = "<i class='fa fa-save'></i>"
        inputTxt.readOnly = false;
        inputTxt.className = 'inputTaskEdit';
    } else {
        EditMode = 0;
        element.innerHTML = "<i class='fa fa-edit'></i>"
        inputTxt.readOnly = true;
        inputTxt.className = 'inputTask';
        httpClient.UpdateTask(event.srcElement.parentElement.id, inputTxt.value, (success) => {
            if(success != null){
                // TODO
            }
        })
    }
}

function addTask(taskId, tasks) {
    console.log('ADDDDD');
    // Left side of item
    // Div
    let task = document.createElement('div');
    task.className = 'task';
    task.setAttribute('id', 'task'+tasks[taskId].id);
    task.addEventListener("click", TaskDone);
    // Span
    let span = document.createElement('span');
    span.setAttribute('id', "p"+tasks[taskId].id);
    span.className = 'doneText fa fa-check';
    span.style.display = 'none';
    // Text
    let txt = document.createElement('input');
    txt.type = 'input';
    txt.readOnly = true;
    txt.autocomplete = 'off';
    txt.spellcheck = false;
    txt.setAttribute('id', "input"+tasks[taskId].id);
    txt.className = 'inputTask';
    txt.value = tasks[taskId].text;

    task.appendChild(span);
    task.appendChild(txt);

    // Right side of item
    // Button Del
    let btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.className = 'btnTask';
    btnEdit.setAttribute('id', "btn"+tasks[taskId].id);
    btnEdit.addEventListener("click", EditTasks);
    // Btn Edit Icon
    let btnEditIcon = document.createElement('i');
    btnEditIcon.className = 'fa fa-edit';


    btnEdit.appendChild(btnEditIcon);

    // Button Del
    let btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btnTask';
    btnDel.addEventListener("click", TaskDelete);

    // Btn Del Icon
    let btnDelIcon = document.createElement('i');
    btnDelIcon.className = 'fa fa-trash';

    btnDel.appendChild(btnDelIcon);

    // Item div
    let item = document.createElement('div');
    item.className = 'item';
    item.setAttribute('id', tasks[taskId].id);

    item.appendChild(task);
    item.appendChild(btnEdit);
    item.appendChild(btnDel);

    document.getElementById('items').appendChild(item);
}

function AddNewTask(){
    console.log('NEEWWW');
    let newTask = document.getElementById("newTask").value;
    if (newTask === ''){
        alert('You can not add empty task!');
        return;
    }

    httpClient.PostTask(newTask, (success) => {
        if(success != null) {
            console.log(ID);
            addTask(0, [{"id": ID, "text": newTask}]);
            document.getElementById("newTask").value = "";
        }
    });
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

    this.UpdateTask = function(id, task, callback){
        httpRequest.open("PUT", "http://localhost:3000/api/tasks/" + id, true);
        httpRequest.setRequestHeader('Content-Type', 'application/json');

        httpRequest.onreadystatechange = function () {
            if (httpRequest.status === 204 && httpRequest.readyState === 4) {
                callback(id);
            } else if (httpRequest.status > 400 && httpRequest.readyState === 4) {
                console.log('Delete Data Failed with Status Code - ' + httpRequest.status);
                callback(null);
            }
        };

        httpRequest.send(JSON.stringify({"id":id, "text":task}));
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