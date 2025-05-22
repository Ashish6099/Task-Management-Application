
        const taskForm = document.getElementById('task-form');
        const taskInput = document.getElementById('task-input');
        const dueDateInput = document.getElementById('due-date');
        const priorityInput = document.getElementById('priority');
        const taskList = document.getElementById('task-list');
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const filterPriority = document.getElementById('filter-priority');
        let draggedItem = null;

        taskForm.addEventListener('submit', addTask);
        taskList.addEventListener('dragstart', dragStart);
        taskList.addEventListener('dragover', dragOver);
        taskList.addEventListener('drop', drop);
        taskList.addEventListener('dragend', dragEnd);
        darkModeToggle.addEventListener('click', toggleDarkMode);
        filterPriority.addEventListener('change', filterTasks);

        // Load tasks from local storage
        loadTasks();

        function addTask(e) {
            e.preventDefault();
            const taskText = taskInput.value.trim();
            const dueDate = dueDateInput.value;
            const priority = priorityInput.value;
            if (taskText) {
                const taskItem = createTaskItem(taskText, dueDate, priority);
                taskList.appendChild(taskItem);
                taskInput.value = '';
                dueDateInput.value = '';
                priorityInput.value = 'low';
                saveTasks();
            }
        }

        function createTaskItem(text, dueDate, priority) {
            const li = document.createElement('li');
            li.className = `list-group-item task-item d-flex justify-content-between align-items-center priority-${priority}`;
            li.draggable = true;
            li.innerHTML = `
                <div>
                    <span class="task-text">${text}</span>
                    ${dueDate ? `<small class="text-muted ms-2">Due: ${dueDate}</small>` : ''}
                </div>
                <div>
                    <button class="btn btn-sm btn-success complete-btn"><i class="fas fa-check"></i></button>
                    <button class="btn btn-sm btn-info edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;

            li.querySelector('.complete-btn').addEventListener('click', toggleComplete);
            li.querySelector('.edit-btn').addEventListener('click', editTask);
            li.querySelector('.delete-btn').addEventListener('click', deleteTask);

            return li;
        }

        function toggleComplete(e) {
            const taskItem = e.target.closest('.task-item');
            taskItem.classList.toggle('completed');
            saveTasks();
        }

        function editTask(e) {
            const taskItem = e.target.closest('.task-item');
            const taskText = taskItem.querySelector('.task-text');
            const newText = prompt('Edit task:', taskText.textContent);
            if (newText !== null && newText.trim() !== '') {
                taskText.textContent = newText.trim();
                saveTasks();
            }
        }

        function deleteTask(e) {
            const taskItem = e.target.closest('.task-item');
            taskList.removeChild(taskItem);
            saveTasks();
        }

        function dragStart(e) {
            draggedItem = e.target;
            setTimeout(() => {
                e.target.classList.add('dragging');
            }, 0);
        }

        function dragOver(e) {
            e.preventDefault();
            const afterElement = getDragAfterElement(taskList, e.clientY);
            const currentElement = document.querySelector('.dragging');
            if (afterElement == null) {
                taskList.appendChild(currentElement);
            } else {
                taskList.insertBefore(currentElement, afterElement);
            }
        }

        function drop(e) {
            e.preventDefault();
            saveTasks();
        }

        function dragEnd(e) {
            e.target.classList.remove('dragging');
            draggedItem = null;
        }

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
        }

        function filterTasks() {
            const priority = filterPriority.value;
            const tasks = taskList.querySelectorAll('.task-item');
            tasks.forEach(task => {
                if (priority === 'all' || task.classList.contains(`priority-${priority}`)) {
                    task.style.display = '';
                } else {
                    task.style.display = 'none';
                }
            });
        }

        function saveTasks() {
            const tasks = [];
            taskList.querySelectorAll('.task-item').forEach(task => {
                tasks.push({
                    text: task.querySelector('.task-text').textContent,
                    dueDate: task.querySelector('small') ? task.querySelector('small').textContent.replace('Due: ', '') : '',
                    priority: task.classList.contains('priority-high') ? 'high' : task.classList.contains('priority-medium') ? 'medium' : 'low',
                    completed: task.classList.contains('completed')
                });
            });
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        function loadTasks() {
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            tasks.forEach(task => {
                const taskItem = createTaskItem(task.text, task.dueDate, task.priority);
                if (task.completed) {
                    taskItem.classList.add('completed');
                }
                taskList.appendChild(taskItem);
            });
        }
