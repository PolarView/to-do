import { v4 as uuidv4 } from 'uuid';

const addTaskInput = <HTMLInputElement>document.querySelector('#taskInput');
const addTaskBtn = <HTMLButtonElement>document.querySelector('.addTaskBtn');
const searchTaskInput = <HTMLInputElement>document.querySelector('.searchTask');
const todosList = <HTMLUListElement>document.querySelector('.tasksContainer');
const clearAllBtn = <HTMLButtonElement>document.querySelector('.clearAllTasksBtn');
const allCategory = <HTMLDivElement>document.querySelector('[data-all-category]');
const inProcessCategory = <HTMLDivElement>document.querySelector('[data-inprocess-category]');
const completedCategory = <HTMLDivElement>document.querySelector('[data-completed-category]');

type Task = {
  taskCaption: string;
  date: string;
  completed: boolean;
  id: string;
};

let tasksData: Task[] = [];

const inputValidation = () => {
  const currentTaskInputValue = addTaskInput.value;
  let unique = true;
  tasksData.forEach((task) => {
    if (task.taskCaption === currentTaskInputValue) unique = false;
  });

  if (addTaskInput.value !== '' && unique) return true;
  else return false;
};

const getCurrentDate = () => {
  let currentDate = new Date();

  const day = currentDate.getDate().toString();
  const mounth = (currentDate.getMonth() + 1).toString();
  const year = currentDate.getFullYear().toString();
  const dayOfWeek = currentDate.toLocaleString('default', { weekday: 'long' });
  const houres = currentDate.getHours().toString();
  const minutes =
    currentDate.getMinutes().toString().length > 1
      ? currentDate.getMinutes().toString()
      : `0${currentDate.getMinutes().toString()}`;
  const formatedDate =
    day + ' ' + mounth + ' ' + year + ' ' + dayOfWeek + ' | ' + houres + ':' + minutes;
  return formatedDate;
};

const renderTodos = (tododDataArr: string[]) => {
  todosList.innerHTML = tododDataArr.join('\n');
  console.log(todosList.innerHTML);
};

const deleteTask = (currentTaskId: string) => {
  tasksData = tasksData.filter((task) => task.id !== currentTaskId);
  updateTodos();
};

const updateTodos = (tasksArr: Task[] = tasksData) => {
  const updatedTodos = tasksArr.map((task) => {
    return `<li class="task" id="${task.id}" >
      <div class="${task.completed ? 'taskInfoCompleted' : 'taskInfo'}" data-toggle-container>
        <div class="taskUpperRowInfo">
        <i class="${
          task.completed ? 'fa-solid fa-check' : 'fa-sharp fa-solid fa-hourglass'
        } checkboxIcon"></i>
          <input class="taskTitle" unselectable="on" onselectstart="return false;" onmousedown="return false;"  value="${
            task.taskCaption
          }">
        </div>
        <div class="taskDataofCreation">${task.date}</div>
      </div>

      <button class="editBtn"  onclick="()=>{deleteTask(task.id)}">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button class="deleteBtn"  >
        <i class="fa-solid fa-trash"></i>
      </button>
    </li>`;
  });
  renderTodos(updatedTodos);
  updateTasksProgress();
  updateDeleteBtns();
  editTask();
};

const toggleCompleted = (taskId: string) => {
  tasksData.forEach((task) => {
    if (task.id === taskId) task.completed = !task.completed;
  });
  updateTodos();
};

function addTask() {
  if (inputValidation()) {
    let task: Partial<Task> = {};
    const currentInputValue = addTaskInput.value;
    task.taskCaption = currentInputValue;
    task.id = uuidv4();
    task.completed = false;
    task.date = getCurrentDate();
    tasksData.push(task as Task);
    addTaskInput.value = '';
    updateTodos();
  }
}

addTaskBtn.addEventListener('click', addTask);
addTaskInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') addTask();
});

function updateTasksProgress() {
  const tasks = document.querySelectorAll('[data-toggle-container]');
  if (tasks.length > 0) {
    (tasks as NodeListOf<HTMLDivElement>).forEach((task) => {
      task.addEventListener('click', () => {
        const currentLiId = task.parentElement!.getAttribute('id')!;
        toggleCompleted(currentLiId);
      });
    });
  } else return;
}

function updateDeleteBtns() {
  const deleteBtns = document.querySelectorAll('.deleteBtn');
  if (deleteBtns.length > 0) {
    (deleteBtns as NodeListOf<HTMLButtonElement>).forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn.parentElement!;
        const currentLiId = el.getAttribute('id')!;
        deleteTask(currentLiId);
      });
    });
  } else return;
}

const searchTask = () => {
  const searchValue = searchTaskInput.value;
  if (searchValue !== '') {
    const filteredTasks = tasksData.filter((task) =>
      task.taskCaption.includes(searchValue.trim()) ? true : false
    );
    updateTodos(filteredTasks);
  } else {
    updateTodos();
  }
};

searchTaskInput.addEventListener('input', searchTask);

function editTask() {
  const editBtns = document.querySelectorAll('.editBtn');
  if (editBtns.length > 0) {
    (editBtns as NodeListOf<HTMLButtonElement>).forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn.parentElement!;
        const currentLiId = el.getAttribute('id')!;
        const onFocusValidation = (taskId: string) => {
          return tasksData.some((task) => task.id === taskId && task.completed !== true);
        };

        const inputElement = <HTMLInputElement>(
          btn.previousElementSibling?.firstElementChild?.lastElementChild!
        );

        if (onFocusValidation(currentLiId)) {
          inputElement.focus();
        }
        const onBlurValidaton = (taskId: string) => {
          const repeatedTaskCaption = tasksData.some(
            (task) => task.id !== taskId && task.taskCaption == inputElement.value
          );
          if (!repeatedTaskCaption && inputElement.value !== '') return true;
          else return false;
        };

        inputElement.addEventListener('input', () => {
          tasksData.forEach((task) => {
            if (task.id === currentLiId) task.taskCaption === inputElement.value;
          });
        });

        inputElement.addEventListener('blur', () => {
          if (!onBlurValidaton(currentLiId)) inputElement.focus();
          else {
            tasksData.forEach((task) => {
              if (task.id === currentLiId) {
                task.taskCaption = inputElement.value;
                task.date = `Edited on ${getCurrentDate()}`;
              }
            });
          }
        });
      });
    });
  } else return;
}

allCategory.addEventListener('click', () => updateTodos());
inProcessCategory.addEventListener('click', () => {
  const inprocessTasks = tasksData.filter((task) => task.completed === false);
  updateTodos(inprocessTasks);
});
completedCategory.addEventListener('click', () => {
  const completedTasks = tasksData.filter((task) => task.completed === true);
  updateTodos(completedTasks);
});

clearAllBtn.addEventListener('click', () => {
  tasksData = [];
  updateTodos();
});
