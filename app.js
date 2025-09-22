const FORM = document.getElementById('task-form');
const INPUT = document.getElementById('task-input');
const LIST = document.getElementById('task-list');
const CLEAR_COMPLETED = document.getElementById('clear-completed');
const CLEAR_ALL = document.getElementById('clear-all');
const COUNTER = document.getElementById('task-counter');
const FILTER_BTNS = Array.from(document.querySelectorAll('.filter-btn'));

const STORAGE_KEY = 'todo.tasks.v1';

let tasks = [];
let filter = 'all';

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load tasks', e);
    tasks = [];
  }
}

function filteredTasks() {
  if (filter === 'active') return tasks.filter(t => !t.done);
  if (filter === 'completed') return tasks.filter(t => t.done);
  return tasks;
}

function updateCounter() {
  const active = tasks.filter(t => !t.done).length;
  const total = tasks.length;
  COUNTER.textContent = `${active} active • ${total} total`;
}

function render() {
  // simple diff-less render: good for small lists
  const current = filteredTasks();
  // remove nodes not matching
  LIST.querySelectorAll('li').forEach(li => {
    const id = li.dataset.id;
    if (!current.find(t => t.id === id)) {
      li.classList.add('leave');
      // remove after animation
      li.addEventListener('animationend', () => li.remove(), { once: true });
    }
  });

  // add/update nodes
  current.forEach(task => {
    let li = LIST.querySelector(`li[data-id="${task.id}"]`);
    const exists = !!li;
    if (!li) {
      li = document.createElement('li');
      li.dataset.id = task.id;
      li.className = 'task enter';
      // cleanup enter class
      li.addEventListener('animationend', () => li.classList.remove('enter'), { once: true });
    }

    li.classList.toggle('done', !!task.done);

    // build inner content
    li.innerHTML = '';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!task.done;
    checkbox.addEventListener('change', () => toggleDone(task.id));

    const label = document.createElement('div');
    label.className = 'label';

    const textSpan = document.createElement('div');
    textSpan.className = 'text';
    textSpan.textContent = task.text;
    textSpan.tabIndex = 0;
    textSpan.addEventListener('dblclick', () => startEdit(task.id));

    // inline edit on Enter/blur
    label.appendChild(textSpan);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-icon';
    editBtn.type = 'button';
    editBtn.title = 'Edit task';
    editBtn.textContent = '✎';
    editBtn.addEventListener('click', () => startEdit(task.id));

    const del = document.createElement('button');
    del.className = 'btn-icon btn-delete';
    del.type = 'button';
    del.title = 'Delete task';
    del.textContent = '✕';
    del.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(del);

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(actions);

    if (!exists) LIST.prepend(li);
  });

  updateCounter();
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const task = { id: Date.now().toString(), text: trimmed, done: false };
  tasks.unshift(task);
  save();
  render();
}

function toggleDone(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  const wasDone = !!t.done;
  t.done = !t.done;
  save();
  render();
  // celebration only when marking done (not unchecking)
  if (!wasDone && t.done) {
    // find the element and compute a spawn point
    const li = LIST.querySelector(`li[data-id="${id}"]`);
    if (li) {
      li.classList.add('burst');
      setTimeout(() => li.classList.remove('burst'), 700);
      const rect = li.getBoundingClientRect();
      spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  }
}

// create simple confetti pieces at (x, y) viewport coords
function spawnConfetti(x, y, count = 18) {
  const colors = ['#ef4444','#f59e0b','#10b981','#06b6d4','#3b82f6','#8b5cf6'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    // randomize size
    const w = 6 + Math.random() * 10;
    const h = 8 + Math.random() * 12;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    // random initial offset
    el.style.left = `${x + (Math.random() - 0.5) * 120}px`;
    el.style.top = `${y + (Math.random() - 0.5) * 30}px`;
    // random rotation
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(el);
    // remove after animation
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}

function deleteTask(id) {
  tasks = tasks.filter(x => x.id !== id);
  save();
  render();
  flashRed();
}

// quick full-screen red flash
function flashRed(duration = 160) {
  const el = document.getElementById('screen-flash');
  if (!el) return;
  el.classList.add('flash-on');
  // remove after duration
  setTimeout(() => el.classList.remove('flash-on'), duration);
}

function startEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const li = LIST.querySelector(`li[data-id="${id}"]`);
  if (!li) return;
  li.classList.add('editing');
  li.innerHTML = '';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!task.done;
  checkbox.addEventListener('change', () => toggleDone(task.id));

  const input = document.createElement('input');
  input.className = 'text-input';
  input.value = task.text;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finishEdit(id, input.value);
    if (e.key === 'Escape') render();
  });
  input.addEventListener('blur', () => finishEdit(id, input.value));

  const actions = document.createElement('div');
  actions.className = 'actions';
  const del = document.createElement('button');
  del.className = 'btn-icon btn-delete';
  del.type = 'button';
  del.title = 'Delete task';
  del.textContent = '✕';
  del.addEventListener('click', () => deleteTask(task.id));
  actions.appendChild(del);

  li.appendChild(checkbox);
  li.appendChild(input);
  li.appendChild(actions);

  input.focus();
  input.select();
}

function finishEdit(id, newText) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  const trimmed = newText.trim();
  if (!trimmed) {
    // empty -> delete
    deleteTask(id);
    return;
  }
  t.text = trimmed;
  save();
  render();
}

FORM.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask(INPUT.value);
  INPUT.value = '';
  INPUT.focus();
});

CLEAR_COMPLETED.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
});

CLEAR_ALL.addEventListener('click', () => {
  if (!confirm('Clear all tasks?')) return;
  tasks = [];
  save();
  render();
});

FILTER_BTNS.forEach(b => b.addEventListener('click', () => {
  FILTER_BTNS.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  filter = b.dataset.filter;
  render();
}));

// initialize
load();
render();
