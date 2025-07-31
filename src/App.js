import React, { useState, useEffect } from "react";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Normal");
  const [subtask, setSubtask] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [firstArray, setFirstArray] = useState([]);
  const [secondArray, setSecondArray] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const pending = JSON.parse(localStorage.getItem("pendingTasks")) || [];
    const completed = JSON.parse(localStorage.getItem("completedTasks")) || [];
    setFirstArray(pending);
    setSecondArray(completed);
  }, []);

  useEffect(() => {
    localStorage.setItem("pendingTasks", JSON.stringify(firstArray));
    localStorage.setItem("completedTasks", JSON.stringify(secondArray));
  }, [firstArray, secondArray]);

  const handleAddTask = () => {
    const trimmed = task.trim();
    if (trimmed) {
      const newTask = {
        text: trimmed,
        dueDate,
        category,
        priority,
        subtask: subtask.trim()
      };

      if (isEditing && editIndex !== null) {
        const updated = [...firstArray];
        updated[editIndex] = newTask;
        setFirstArray(updated);
        setIsEditing(false);
        setEditIndex(null);
        toast.success("Task updated!");
      } else {
        setFirstArray([...firstArray, newTask]);
        toast.success("Task added!");
      }

      setTask("");
      setDueDate("");
      setCategory("General");
      setPriority("Normal");
      setSubtask("");
    } else {
      toast.warning("Please enter a task.");
    }
  };

  const handleEdit = (index) => {
    const current = firstArray[index];
    setTask(current.text);
    setDueDate(current.dueDate);
    setCategory(current.category);
    setPriority(current.priority);
    setSubtask(current.subtask || "");
    setIsEditing(true);
    setEditIndex(index);
  };

  const markAsCompleted = (index) => {
    const task = firstArray[index];
    setFirstArray(firstArray.filter((_, i) => i !== index));
    setSecondArray([...secondArray, task]);
    toast.info("Task marked as completed!");
  };

  const markAsPending = (index) => {
    const task = secondArray[index];
    setSecondArray(secondArray.filter((_, i) => i !== index));
    setFirstArray([...firstArray, task]);
    toast.info("Task moved to pending!");
  };

  const deleteTask = (index, type) => {
    if (type === "pending") {
      setFirstArray(firstArray.filter((_, i) => i !== index));
      toast.error("Task deleted from pending.");
    } else {
      setSecondArray(secondArray.filter((_, i) => i !== index));
      toast.error("Task deleted from completed.");
    }
  };

  const filterTasks = (tasks) => {
    return tasks
      .filter(task =>
        task.text.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterStatus === "all" || task.category === filterStatus)
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const isOverdue = (due) => {
    return due && new Date(due) < new Date() && new Date(due).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="container">
      <h1>📝 React To-Do App</h1>

      <div className="input-box">
        <input
          type="text"
          className={isEditing ? "editing" : ""}
          placeholder={isEditing ? "Update task..." : "Enter a task..."}
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Optional subtask..."
          value={subtask}
          onChange={(e) => setSubtask(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="General">General</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Urgent">Urgent</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Normal">Normal</option>
          <option value="High">High</option>
        </select>
        <button className={isEditing ? "editing" : ""} onClick={handleAddTask}>
          {isEditing ? "Update" : "Add"}
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="General">General</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      <div className="tasks">
        <div className="task-list pending">
          <h2>Pending Tasks</h2>
          {filterTasks(firstArray).length === 0 ? (
            <p className="empty">No pending tasks</p>
          ) : (
            filterTasks(firstArray).map((t, index) => (
              <div
                className={`task-item ${isOverdue(t.dueDate) ? "overdue" : ""}`}
                key={index}
              >
                <label>
                  <input
                    type="checkbox"
                    onChange={() => markAsCompleted(index)}
                  />
                  <span>
                    {t.text} {t.subtask && ` > ${t.subtask}`} {t.dueDate && ` | Due: ${t.dueDate}`} {t.category && ` | ${t.category}`} {t.priority && ` | Priority: ${t.priority}`}
                  </span>
                </label>
                <div>
                  <button onClick={() => handleEdit(index)}>✏️</button>
                  <button onClick={() => deleteTask(index, "pending")}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="task-list completed">
          <h2>Completed Tasks</h2>
          {filterTasks(secondArray).length === 0 ? (
            <p className="empty">No completed tasks</p>
          ) : (
            filterTasks(secondArray).map((t, index) => (
              <div className="task-item" key={index}>
                <label>
                  <input
                    type="checkbox"
                    checked
                    onChange={() => markAsPending(index)}
                  />
                  <span className="completed-text">
                    {t.text} {t.subtask && ` > ${t.subtask}`} {t.dueDate && ` | Due: ${t.dueDate}`} {t.category && ` | ${t.category}`} {t.priority && ` | Priority: ${t.priority}`}
                  </span>
                </label>
                <button onClick={() => deleteTask(index, "completed")}>🗑️</button>
              </div>
            ))
          )}
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
