// Variables
var ID = 0;
var EditMode = 0;
var httpClient = new HttpClient();


// Events
window.onload = function () {
    httpClient.FetchTasks(FetchTasks);
};

function TaskDone(event) {
    if(EditMode === 1)
        return;
    let element = event.target;
    let parentElementId =  element.parentElement.id;

    let spanElement = document.getElementById('p' + parentElementId);
    let editBtn = document.getElementById('editBtn'+ parentElementId);

    if (!element.classList.contains('taskDone')) {
        element.classList.add('taskDone');
        spanElement.style.display = 'inline-block';
        editBtn.classList.add('btnTaskDisable');

    } else {
        element.classList.remove('taskDone');
        spanElement.style.display = 'none';
        editBtn.classList.remove('btnTaskDisable');
    }
}

function TaskDelete(event) {
    if(EditMode === 0) {
        httpClient.DeleteTask(event.target.parentElement.id, (success) => {
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
        addTask(tasks[taskId]);
    }
}

function EditTasks(event){
    let element = event.target;
    let parentID = element.parentElement.id;
    let inputTxt = document.getElementById('input' + parentID);

    if(document.getElementById('task'+parentID).classList.contains('taskDone'))
        return;

    if (EditMode === 0) {
        EditMode = 1;
        element.innerHTML = "<i class='fa fa-save'></i>";
        inputTxt.readOnly = false;
        inputTxt.className = 'inputTaskEdit';
    } else {
        httpClient.UpdateTask(parentID, inputTxt.value, (success) => {
            if (success != null) {
                EditMode = 0;
                element.innerHTML = "<i class='fa fa-edit'></i>";
                inputTxt.readOnly = true;
                inputTxt.className = 'inputTask';
            }
        })
    }
}

function addTask(task) {
    // Left side of item
    // Div
    let taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.setAttribute('id', 'task'+ task.id);
    taskDiv.addEventListener("click", TaskDone);
    // Span
    let span = document.createElement('span');
    span.className = 'doneSpan fa fa-check';
    span.setAttribute('id', "p"+ task.id);
    span.style.display = 'none';
    // Text
    let txt = document.createElement('input');
    txt.type = 'input';
    txt.readOnly = true;
    txt.autocomplete = 'off';
    txt.spellcheck = false;
    txt.setAttribute('id', "input" + task.id);
    txt.className = 'inputTask';
    txt.value = task.text;

    taskDiv.appendChild(span);
    taskDiv.appendChild(txt);

    // Right side of item
    // Button Edit
    let btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.className = 'btn btnTask';
    btnEdit.setAttribute('id', "editBtn"+ task.id);
    btnEdit.addEventListener("click", EditTasks);
    // Button Edit Icon
    let btnEditIcon = document.createElement('i');
    btnEditIcon.className = 'fa fa-edit';

    btnEdit.appendChild(btnEditIcon);

    // Button Delete
    let btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btn btnTask';
    btnDel.addEventListener("click", TaskDelete);
    // Button Delete Icon
    let btnDelIcon = document.createElement('i');
    btnDelIcon.className = 'fa fa-trash';

    btnDel.appendChild(btnDelIcon);

    // Item div
    let item = document.createElement('div');
    item.className = 'item';
    item.setAttribute('id', task.id);

    item.appendChild(taskDiv);
    item.appendChild(btnEdit);
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
            addTask({"id": ID, "text": newTask});
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
                console.log('Update Data Failed with Status Code - ' + httpRequest.status);
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
                console.log('Post Data Failed with Status Code - ' + httpRequest.status);
                callback(null);
            }
        };
        httpRequest.send(JSON.stringify({"id":++ID, "text":task}));
    }
}