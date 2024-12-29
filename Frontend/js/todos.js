const apiUrl = 'https://knowledgeable-aquatic-lasagna.glitch.me/todos'; 
const todoList = document.getElementById('todos');
const addTodoForm = document.getElementById('add-todo-form');

function fetchTodos() {
  fetch(apiUrl)
    .then(response => response.json())
    .then(todos => {
      todoList.innerHTML = '';
      todos.forEach(todo => {
        displayTodo(todo);
      });
    })
    .catch(error => console.error('Error fetching todos:', error));
}

function displayTodo(todo) {
  const todoItem = document.createElement('li');
  todoItem.classList.add('todo-item');
  
  const todoTitle = document.createElement('span');
  todoTitle.textContent = `${todo.title}: `;
  todoItem.appendChild(todoTitle);
  
  const todoDescription = document.createElement('span');
  todoDescription.textContent = todo.description;
  todoItem.appendChild(todoDescription);

  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.onclick = () => editTodo(todo);
  todoItem.appendChild(editButton);
  
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.onclick = () => deleteTodo(todo.id);
  todoItem.appendChild(deleteButton);
  
  todoList.appendChild(todoItem);
}

addTodoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById('todo-title').value;
  const description = document.getElementById('todo-description').value;
  
  const newTodo = {
    title,
    description,
    completed: false,
  };
  
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTodo),
  })
    .then(response => response.json())
    .then(todo => {
      displayTodo(todo);
      addTodoForm.reset();
    })
    .catch(error => console.error('Error adding todo:', error));
});

function editTodo(todo) {
  const newTitle = prompt('Edit title:', todo.title);
  const newDescription = prompt('Edit description:', todo.description);
  
  if (newTitle !== null && newDescription !== null) {
    const updatedTodo = {
      ...todo,
      title: newTitle,
      description: newDescription,
    };
    
    fetch(`${apiUrl}/${todo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTodo),
    })
      .then(response => response.json())
      .then(updatedTodo => {
        fetchTodos();
      })
      .catch(error => console.error('Error updating todo:', error));
  }
}

function deleteTodo(todoId) {
  if (confirm('Are you sure you want to delete this todo?')) {
    fetch(`${apiUrl}/${todoId}`, {
      method: 'DELETE',
    })
      .then(() => {
        fetchTodos();
      })
      .catch(error => console.error('Error deleting todo:', error));
  }
}

fetchTodos();
