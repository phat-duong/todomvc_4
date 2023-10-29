const inputEl = document.getElementById('input') as HTMLInputElement
const listEl = document.getElementById('list')
const countEl = document.getElementById('count')
const toggleAllEl = document.getElementById('toggle-all')
const clearCompletedEl = document.getElementById('clear-completed')
const changeThemeEl = document.getElementById('change-theme')

type Todo = {
  id: string
  value: string
  checked: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
let todos: Todo[] = []

async function getTodos() {
  const res = await fetch('https://650446efc8869921ae24cc6d.mockapi.io/todos')
  todos = (await res.json()) as Todo[]
  renderTodos()
}

async function updateTodo(id: string, todo: Partial<Todo>) {
  try {
    const res = await fetch(`https://650446efc8869921ae24cc6d.mockapi.io/todos/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(todo)
    })
    const updatedTodo = (await res.json()) as Todo
    todos = todos.map(todo => (todo.id === id ? updatedTodo : todo))
    renderTodos()
  } catch (error) {
    console.error(error)
  }
}

async function deleteTodo(id: string) {
  try {
    await fetch(`https://650446efc8869921ae24cc6d.mockapi.io/todos/${id}`, {
      method: 'DELETE'
    })
    todos = todos.filter(todo => todo.id !== id)
    renderTodos()
  } catch (error) {
    console.error(error)
  }
}

async function createTodo(todo: Partial<Todo>) {
  try {
    const res = await fetch(`https://650446efc8869921ae24cc6d.mockapi.io/todos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(todo)
    })
    const newTodo = (await res.json()) as Todo
    todos.push(newTodo)
    renderTodos()
  } catch (error) {
    console.error(error)
  }
}

const theme = localStorage.getItem('theme')
if (theme === 'dark') {
  document.documentElement.classList.add('dark')
  setDarkTheme()
}

function setDarkTheme() {
  localStorage.setItem('theme', 'dark')
  changeThemeEl!.innerHTML = `
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
      `
}

function createTodoItemEl(todo: Todo) {
  const li = document.createElement('li')
  li.dataset.id = String(todo.id)
  li.className = 'group border-b flex justify-between border-b-gray-300 p-4'
  li.insertAdjacentHTML(
    'afterbegin',
    `
        <div class="flex gap-3 items-center">
        <svg data-todo="toggle" class="${todo.checked ? 'text-green-500' : ''
    }" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle">
        ${todo.checked
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>'
      : '<circle cx="12" cy="12" r="10"/>'
    }
        </svg>
        <div contenteditable="true" data-todo="value" class="text-2xl p-2 ${todo.checked ? 'line-through' : ''}">${todo.value
    }</div>
        </div>
        <svg data-todo="delete" class="cursor-pointer hidden group-hover:block" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        `
  )
  return li
}

function renderTodos() {
  const filter = document.location.hash.replace(/^#\//, '')
  let filterTodos = [...todos]
  if (filter === 'active') {
    filterTodos = todos.filter(todo => !todo.checked)
  } else if (filter === 'completed') {
    filterTodos = todos.filter(todo => todo.checked)
  }

  listEl!.replaceChildren(...filterTodos.map(todo => createTodoItemEl(todo)))
  let check = 0
  todos.forEach(item => {
    if (item.checked) {
      check++
    }
  })
  countEl!.innerText = String(todos.length - check)
  if (check === todos.length && todos.length !== 0) {
    toggleAllEl!.classList.add('text-black', 'cursor-pointer')
  } else {
    toggleAllEl!.classList.remove('text-black', 'cursor-pointer')
  }

  const haveOneCompletedItem = todos.some(item => item.checked)
  if (haveOneCompletedItem) {
    clearCompletedEl!.classList.toggle('invisible')
  }
}

clearCompletedEl!.onclick = () => {
  todos = todos.filter(item => !item.checked)
  renderTodos()
}

toggleAllEl!.onclick = e => {
  const target = e.target as HTMLLIElement
  if (target.classList.contains('text-black')) {
    todos.forEach(item => {
      item.checked = false
    })
  }
  renderTodos()
}

inputEl.onkeyup = async e => {
  if (e.key === 'Enter') {
    await createTodo({
      value: inputEl.value,
      checked: false
    })
    inputEl.value = ''
  }
}

listEl!.onclick = e => {
  const target = e.target as HTMLLIElement
  if (target.getAttribute('data-todo') === 'toggle') {
    const id = target.parentElement!.parentElement!.dataset.id!
    const newTodo = todos.find(item => item.id === id)
    updateTodo(id, {
      checked: !newTodo!.checked
    })
  }

  if (target.getAttribute('data-todo') === 'delete') {
    const id = target.parentElement!.dataset.id!
    deleteTodo(id)
  }
}

listEl!.onkeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLLIElement
  if (e.keyCode === 13) {
    e.preventDefault()
    if (target.getAttribute('data-todo') === 'value') {
      const id = target.parentElement!.parentElement!.dataset.id!
      updateTodo(id, {
        value: target.innerText
      })
    }
  }
}

changeThemeEl!.onclick = () => {
  document.documentElement.classList.toggle('dark')
  if (document.documentElement.classList.contains('dark')) {
    setDarkTheme()
  } else {
    changeThemeEl!.innerHTML = `
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      `
    localStorage.setItem('theme', 'light')
  }
}

window.addEventListener('hashchange', () => {
  renderTodos()
})

getTodos()
