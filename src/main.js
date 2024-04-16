const BASE_URL = "http://localhost:3000/todos";

const form = document.querySelector(".todo-form");
const container = document.querySelector(".list");

form.addEventListener("submit", handleSubmit);
container.addEventListener("click", handleDelete);
container.addEventListener("click", handleUpdate);

async function fetchData(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.json();
}


fetchData(BASE_URL)
  .then((todos) => {
    container.innerHTML = createMarkup(todos);
  })
  .catch((error) => console.error("Error fetching todos:", error));

function createMarkup(arr) {
  return arr
    .map(({ id, title, completed }) => `
      <li data-id="${id}" class="list-item">
        <input type="checkbox" class="list-checkbox" ${completed && "checked"}>
        <h2 class="list-title">${title}</h2>
        <button class="list-btn">X</button>
      </li>
    `)
    .join("");
}

async function handleSubmit(event) {
  event.preventDefault();
  const { todo } = event.currentTarget.elements;

  try {
    const newTask = { title: todo.value, completed: false };
    await fetchData(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });

    const todos = await fetchData(BASE_URL);
    container.innerHTML = createMarkup(todos);

    form.reset();
  } catch (error) {
    console.error("Failed to add task:", error.message);
  }
}

async function handleUpdate(event) {
  if (!event.target.classList.contains("list-checkbox")) {
    return;
  }
  event.preventDefault();

  const parent = event.target.closest(".list-item");
  const id = parent.dataset.id;

  try {
    await fetchData(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: event.target.checked }),
    });
  } catch (error) {
    console.error("Failed to update task:", error.message);
  }
}

function handleDelete(event) {
  if (!event.target.classList.contains("list-btn")) {
    return;
  }
  const parent = event.target.closest(".list-item");
  const id = parent.dataset.id;

  fetchData(`${BASE_URL}/${id}`, {
    method: "DELETE",
  })
    .then(() => {
      parent.remove();
    })
    .catch((error) => {
      console.error("Failed to delete task:", error.message);
    });
}