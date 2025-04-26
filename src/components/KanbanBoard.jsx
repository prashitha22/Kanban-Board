import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    // Fetch initial todos from API
    fetch("https://jsonplaceholder.typicode.com/todos?_limit=0")
      .then((res) => res.json())
      .then((data) => {
        const todos = data.map((item) => ({
          id: String(item.id),
          title: item.title,
          completed: item.completed,
        }));

        const todoTasks = todos.filter((t) => !t.completed);
        const doneTasks = todos.filter((t) => t.completed);

        setTasks({
          todo: todoTasks,
          inProgress: [], // start empty
          done: doneTasks,
        });
      });
  }, []);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceColumn = tasks[source.droppableId];
    const destColumn = tasks[destination.droppableId];

    const sourceTasks = [...sourceColumn];
    const destTasks = [...destColumn];

    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setTasks((prev) => ({
        ...prev,
        [source.droppableId]: sourceTasks,
      }));
    } else {
      destTasks.splice(destination.index, 0, movedTask);
      setTasks((prev) => ({
        ...prev,
        [source.droppableId]: sourceTasks,
        [destination.droppableId]: destTasks,
      }));
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(), // unique id
      title: newTaskTitle.trim(),
      completed: false,
    };

    setTasks((prev) => ({
      ...prev,
      todo: [newTask, ...prev.todo], // add to "To Do"
    }));

    setNewTaskTitle("");
  };

  const columns = [
    { key: "todo", title: "To Do" },
    { key: "inProgress", title: "In Progress" },
    { key: "done", title: "Done" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Add New Task Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
        <div className="flex">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="border p-2 flex-1 rounded-l"
            placeholder="Enter task title..."
          />
          <button
            onClick={handleAddTask}
            className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6">
          {columns.map((column) => (
            <div key={column.key} className="flex-1">
              <h2 className="text-xl font-bold mb-4">{column.title}</h2>
              <Droppable droppableId={column.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-white rounded-lg shadow-md p-4 space-y-4 min-h-[300px] transition-colors ${
                      snapshot.isDraggingOver ? "bg-blue-100" : ""
                    }`}
                  >
                    {tasks[column.key].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-blue-100 rounded p-3 ${
                              snapshot.isDragging ? "bg-blue-300" : ""
                            }`}
                          >
                            {task.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
