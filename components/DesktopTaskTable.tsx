"use client";
import 'sweetalert2/dist/sweetalert2.min.css';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import tasksData from "../data/data.json"; // Ensure this path is correct
import { FaPen, FaTrash, FaSearch, FaSort, FaFilter } from 'react-icons/fa'; // Importing icons from react-icons
import Swal from 'sweetalert2';

type Priority = 'Low' | 'Medium' | 'High';

interface Task {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  status: string;
  priority: Priority;
}

const TaskTable: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  
  useEffect(() => {
    // Load tasks from local storage on component mount
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      // If no tasks in local storage, use initial data
      setTasks(tasksData.map(task => ({ ...task, priority: 'Low' as Priority })));
    }
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Save tasks to local storage whenever tasks change
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  if (!isClient) {
    return null; // or a loading spinner
  }

  const handlePriorityChange = (taskId: number, newPriority: Priority) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, priority: newPriority } : task
      )
    );
  };

  const handleEdit = async (taskId: number) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (!taskToEdit) return;
  
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: 'Edit Task',
      html: `
      <div>Title</div>
        <input id="swal-input1" class="swal2-input" placeholder="Title" value="${taskToEdit.name}">
        <div>Description</div>
        <input id="swal-input2" class="swal2-input" placeholder="Description" value="${taskToEdit.description}">
         <div>Choose Due Date</div>
        <input type="date" id="swal-input3" class="swal2-input" value="${taskToEdit.dueDate}">
         <div>Status</div>
        <select id="swal-input4" class="swal2-input">
          <option value="In Progress" ${taskToEdit.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Completed" ${taskToEdit.status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      confirmButtonColor: '#941B0F',
      cancelButtonColor: '#000000',
      preConfirm: () => {
        return {
          title: (document.getElementById('swal-input1') as HTMLInputElement).value,
          description: (document.getElementById('swal-input2') as HTMLInputElement).value,
          dueDate: (document.getElementById('swal-input3') as HTMLInputElement).value,
          status: (document.getElementById('swal-input4') as HTMLSelectElement).value
        };
      }
    });
  
    if (isConfirmed && formValues) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...formValues, name: formValues.title } : task
        )
      );
  
      // Update the task title on the page instantly
      document.querySelectorAll("td").forEach(td => {
        if (td.textContent === taskToEdit.name) {
          td.textContent = formValues.title;
        }
      });
  
      Swal.fire('Task updated!', '', 'success');
    }
  };
  

  const handleDelete = async (taskId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure you want to delete this task?',
      text: 'This action cannot be undone!',
      
      showCancelButton: true,
      confirmButtonColor: '#941B0F',
      cancelButtonColor: '#000000',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel!',
    });

    if (result.isConfirmed) {
      console.log(`Delete task with ID: ${taskId}`);
      setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
      Swal.fire('Deleted!', 'Your task has been deleted.', 'success');
    }
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) => {
    return (
      (!filterPriority || task.priority === filterPriority) &&
      (!filterStatus || task.status === filterStatus) &&
      task.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddTask = async () => {
    console.log("Add Task button clicked");
  
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: 'Add Task',
      html: `
        <div className="mt-1">Title</div>
        <input id="swal-input1" class="swal2-input" placeholder="Title">
        <div className="mt-1">Description</div>
        <input id="swal-input2" class="swal2-input" placeholder="Description">
        <div >Choose Due Date</div>
        <input type="date" id="swal-input3" class="swal2-input">
      `,
      focusConfirm: false,
      showCancelButton: true, // Show the cancel button
      confirmButtonText: 'Add Task', // Text for the confirm button
      cancelButtonText: 'Cancel', // Text for the cancel button
      confirmButtonColor: '#941B0F',
      cancelButtonColor: '#000000',
      
      preConfirm: () => {
        const title = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const description = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const dueDate = (document.getElementById('swal-input3') as HTMLInputElement).value;
  
        if (!title || !description || !dueDate) {
          Swal.showValidationMessage('Please enter all fields');
        }
  
        return { title, description, dueDate };
      }
    });
  
    // Check if the user confirmed the addition of the task
    if (isConfirmed && formValues) {
      // Create a new task object with status set to 'In Progress'
      const newTask: Task = {
        id: tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1, // Generate a new ID
        name: formValues.title, // Use the title from the form
        description: formValues.description,
        dueDate: formValues.dueDate,
        status: 'In Progress', // Set status to 'In Progress'
        priority: 'Low' // Default priority
      };
  
      // Update the tasks state with the new task
      setTasks([...tasks, newTask]);
      Swal.fire('Task added!', '', 'success');
    }
  };

  const handleSort = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      return sortOrder === 'asc'
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    });
    setTasks(sortedTasks);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  const handleFilter = () => {
    setShowFilter((prev) => !prev);
  };
  
  

  return (
    <div className="bg-white text-black max-h-screen">
      
   
    <div className="flex flex-col items-center my-12 px-4">
     
      <div className="flex justify-between w-full mb-8">
      <div className="w-full"><Image src="/Screenshot.png" alt="Studio 137 Logo" width={250} height={100} />
        <h1 className="text-2xl font-bold clear-both text-centre mt-2 ml-8 max-w-[300px] w-full">Tasks</h1></div>
        <div className="relative w-full max-w-[200px] mt-5 hidden sm:block">
  <FaSearch className="absolute left-3 top-2 text-gray-400" />
  <input
    type="text"
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="border border-gray-300 rounded p-2 pl-10 w-full"
  />
</div>
 
      </div>

      {/* Buttons for Add Task, Sort, and Filter */}
      <div className="flex justify-end gap-2 w-full mb-4">
  <button onClick={handleAddTask} className="bg-red-800 text-white px-4 py-2 rounded">
    Add Task
  </button>

  {/* Sort Button: Show full text on large screens, icon-only on mobile */}
  <button
    onClick={handleSort}
    className="border border-red-800 bg-white text-red-800 px-4 py-2 rounded hover:bg-green-600 transition flex items-center sm:px-2 sm:py-2"
  >
    <FaSort className="mr-2 sm:mr-0" />
    <span className="hidden sm:inline">Sort</span>
  </button>

  {/* Filter Button: Show full text on large screens, icon-only on mobile */}
  <div className="relative">
    <button
      onClick={handleFilter}
      className="border border-red-800 bg-white text-red-800 px-4 py-2 rounded hover:bg-yellow-600 transition flex items-center sm:px-2 sm:py-2"
    >
      <FaFilter className="mr-2 sm:mr-0" />
      <span className="hidden sm:inline">Filter</span>
    </button>

    {showFilter && (
      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
        <label className="block text-sm font-semibold">Priority</label>
        <select
          className="w-full border border-gray-300 rounded p-1 mb-2"
          value={filterPriority || ""}
          onChange={(e) => setFilterPriority(e.target.value || null)}
        >
          <option value="">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <label className="block text-sm font-semibold">Status</label>
        <select
          className="w-full border border-gray-300 rounded p-1"
          value={filterStatus || ""}
          onChange={(e) => setFilterStatus(e.target.value || null)}
        >
          <option value="">All</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    )}
  </div>
</div>

   {/* Table for Desktop */}
   <div className="hidden sm:block w-full">
  <table id="task-table" className="min-w-full border-collapse border-2 border-[#941B0F] mx-4">
    <thead>
      <tr className="bg-[#FFF9F8] border-2 border-[#941B0F] text-[#941B0F]">
        <th className="border border-light-red text-center p-2">SL.No</th>
        <th className="border border-light-red text-center p-2">Title</th>
        <th className="border border-gray-300 text-center p-2">Description</th>
        <th className="border border-gray-300 text-center p-2">Due Date</th>
        <th className="border border-gray-300 text-center p-2 min-w-[150px]">Status</th>
        <th className="border border-gray-300 text-center p-2">Priority</th>
       
      </tr>
    </thead>
    <tbody>
  {filteredTasks.length > 0 ? (
    filteredTasks.map((task, index) => (
      <tr key={task.id} className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-[#FFF9F8]'}`}>
        <td className="border border-light-red text-center p-2">{index + 1}</td>
        <td className="border border-light-red text-center p-2">{task.name}</td>
        <td className="border border-gray-300 text-center p-2">{task.description}</td>
        <td className="border border-gray-300 text-center p-2">{task.dueDate}</td>
       <td className="border border-gray-300 text-center p-2 min-w-[150px]">
  <span
    className={`px-2 py-1 rounded-full text-white ${
      task.status === "Completed" ? "bg-green-500" : "bg-yellow-500"
    }`}
  >
    {task.status}
  </span>
</td>
        <td className="border border-gray-300 text-center p-2">
          <select
            value={task.priority}
            onChange={(e) => handlePriorityChange(task.id, e.target.value as Priority)}
            className="border border-gray-300 rounded p-1"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </td>
        <td className="border border-gray-300 text-center p-2 flex justify-center items-center">
          <FaPen className="cursor-pointer mx-2 hover:text-blue-500" onClick={() => handleEdit(task.id)} />
          <FaTrash className="cursor-pointer mx-2 hover:text-red-500" onClick={() => handleDelete(task.id)} />
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7} className="text-center text-gray-500 p-4">
        No Task Found
      </td>
    </tr>
  )}
</tbody>

  </table>
</div>


{/* Mobile View: Display Tasks as Cards */}
{/* Mobile View: Display Tasks as Cards */}
<div className="sm:hidden w-full">
  {filteredTasks.length > 0 ? (
    filteredTasks.map((task, index) => (
      <div key={task.id} className="bg-[#FFF9F8] border border-gray-300 rounded-lg p-4 mb-4 shadow-md">
        <p className="text-red-600"><strong>Title:</strong> <span className="text-black">{task.name}</span></p>
        <p className="text-red-600"><strong>Description:</strong> <span className="text-black">{task.description}</span></p>
        <p className="text-red-600"><strong>Due Date:</strong> <span className="text-black">{task.dueDate}</span></p>
        <p className="text-red-600"><strong>Status:</strong> 
          <span className={`px-2 py-1 rounded-full text-white ml-2 ${task.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {task.status}
          </span>
        </p>
        <p className="text-red-600"><strong>Priority:</strong> 
          <select
            value={task.priority}
            onChange={(e) => handlePriorityChange(task.id, e.target.value as Priority)}
            className="border border-gray-300 rounded p-1 ml-2 text-black"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </p>
        <div className="flex justify-start mt-2">
          <FaPen className="cursor-pointer mx-2 hover:text-blue-500" onClick={() => handleEdit(task.id)} />
          <FaTrash className="cursor-pointer mx-2 hover:text-red-500" onClick={() => handleDelete(task.id)} />
        </div>
      </div>
    ))
  ) : (
    <div className="text-center text-gray-500 p-4">
      No Task Found
    </div>
  )}
</div>

  

      <style jsx>{`
      body {
    background-color: white;
  }
  
        .status {
          display: inline-block;
          padding: 0.5em 1em;
          border-radius: 10px; /* Adjusted border radius for a softer rectangular shape */
          color: white; /* Text color */
        }
        .completed {
          background-color: green; /* Green background for Completed */
        }
        .in-progress {
          background-color: yellow; /* Yellow background for In Progress */
          color: black; /* Black text for better contrast */
        }
        .bg-light-red {
          background-color: #ffcccb; /* Light red background */
        }
      `}</style>
    </div>
    </div>
  );
};

export default TaskTable;
