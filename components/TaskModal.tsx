import React, { useState, useEffect } from 'react';
import { ITask, statusEnum, useTaskContext } from './TaskContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: ITask | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { addTask, updateTask } = useTaskContext(); 

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<statusEnum>(statusEnum.PENDING);
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  useEffect(() => {
    if (taskToEdit) {
      setName(taskToEdit.name || '');
      setDescription(taskToEdit.description || '');
      setDueDate(taskToEdit.dueDate || '');
      setStatus(taskToEdit.status || statusEnum.PENDING);
      setPriority(taskToEdit.priority || 'Medium');
    } else {
      setName('');
      setDescription('');
      setDueDate('');
      setStatus(statusEnum.PENDING);
      setPriority('Medium');
    }
  }, [taskToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedTask: ITask = {
        id: taskToEdit ? taskToEdit.id : Date.now(),
        name: name.trim(),
        description: description.trim(),
        dueDate,
        status,
        priority,
    };

    console.log("Submitting Task:", updatedTask);

    if (taskToEdit) {
        updateTask(updatedTask);  // Ensure correct function call
    } else {
        addTask(updatedTask);
    }

    onClose();
};


  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">{taskToEdit ? 'Edit Task' : 'Add Task'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <label htmlFor="task-name" className="text-gray-700 font-medium">Title</label>
          <input id="task-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Title" required className="border rounded p-2 w-full"/>

          <label htmlFor="task-description" className="text-gray-700 font-medium">Description</label>
          <textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="border rounded p-2 w-full h-24"/>

          <label htmlFor="task-due-date" className="text-gray-700 font-medium">Choose Due Date</label>
          <input id="task-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="border rounded p-2 w-full"/>
          
          <label htmlFor="task-priority" className="text-gray-700 font-medium">Priority</label>
          <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')} className="border rounded p-2 w-full">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          
          {taskToEdit && (
            <>
              <label htmlFor="task-status" className="text-gray-700 font-medium">Status</label>
              <select id="task-status" value={status} onChange={(e) => setStatus(e.target.value as statusEnum)} className="border rounded p-2 w-full">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </>
          )}

          <div className="flex justify-between mt-4">
            <button type="button" onClick={onClose} className="border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-100 transition-all">Cancel</button>
            <button type="submit" className="bg-[#941B0F] text-white px-4 py-2 rounded-md hover:bg-[#7A140C] transition-all">
              {taskToEdit ? 'Edit Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;