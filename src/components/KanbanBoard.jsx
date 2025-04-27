import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Home,
  ClipboardList,
  Calendar,
  Bell,
  Cog,
  LogOut
} from 'lucide-react'; 

export default function KanbanBoard() {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  useEffect(() => {
  
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
          inProgress: [], 
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
      id: Date.now().toString(), 
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      completed: false,
    };

    setTasks((prev) => ({
      ...prev,
      todo: [newTask, ...prev.todo], 
    }));

    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  const columns = [
    { key: "todo", title: "To Do" },
    { key: "inProgress", title: "In Progress" },
    { key: "done", title: "Done" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex ">
        <aside className="w-16 md:w-20 bg-[#583185] flex flex-col items-center py-6 space-y-8">
        
        <Home className="h-6 w-6 text-white hover:text-[#c597f5] cursor-pointer" />

        <ClipboardList className="h-6 w-6 text-white hover:text-[#c597f5] cursor-pointer" />

        <Calendar className="h-6 w-6 text-white hover:text-[#c597f5] cursor-pointer" />

        <Bell className="h-6 w-6 text-white hover:text-[#c597f5] cursor-pointer" />

        <Cog className="h-6 w-6 text-white hover:text-[#c597f5] cursor-pointer" />

        <LogOut className="h-6 w-6 text-white hover:text-[#c597f5] cursor-pointer" />

      </aside>

      <div className="flex-1 flex flex-col">
        
 
        <header className="bg-[#eee8f2] p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#583185]">Task Board</h1>
          <div className="relative w-48">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-white shadow-sm focus:outline-none"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              🔍
            </div>
          </div>
        </header>

      <div className=" py-6 px-8">
        <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="border p-2 flex-1 rounded"
            placeholder="Enter task title..."
          />
          <input
            type="text"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="border p-2 flex-1 rounded"
            placeholder="Enter task description (optional)..."
          />
          <button
            onClick={handleAddTask}
            className="bg-[#583185] text-white px-4 rounded h-[43px] cursor-pointer"
          >
            + Add
          </button>
        </div>
      </div>


      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex max-sm:flex-col sm:flex-col md:flex-row xl:flex-row lg:flex-row 2xl:flex-row gap-6 p-8">
          {columns.map((column) => (
            <div key={column.key} className="flex-1">
              <h2 className="text-xl font-bold mb-4 ">{column.title}</h2>
              <Droppable droppableId={column.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-white border-t-4 border-[#b07aed] rounded-lg shadow-md p-4 space-y-4 min-h-[300px] transition-colors ${
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
                           <div className="font-semibold">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-gray-600 mt-1">
                                {task.description}
                              </div>
                            )}
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
    </div>
  );
}
