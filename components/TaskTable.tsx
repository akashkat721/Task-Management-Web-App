import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ITask {
    id: number;
    name: string;
    description: string;
    dueDate: string;
    priority: 'High' | 'Medium' | 'Low';
    status: statusEnum;
}

export enum statusEnum {
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
    PENDING = 'Pending',
}

interface TaskContextType {
    tasks: ITask[];
    addTask: (task: ITask) => void;
    editTask: (task: ITask) => void;
    deleteTask: (id: number) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<ITask[]>(() => {
        if (typeof window !== "undefined") {
            const savedTasks = localStorage.getItem("tasks");
            return savedTasks ? JSON.parse(savedTasks) : [];
        }
        return [];
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("tasks", JSON.stringify(tasks));
        }
    }, [tasks]);

    const addTask = (task: ITask) => setTasks([...tasks, task]);
    
    const editTask = (updatedTask: ITask) => {
        setTasks(prevTasks => {
            const newTasks = prevTasks.map(task =>
                task.id === updatedTask.id ? { ...task, ...updatedTask } : task
            );
            localStorage.setItem("tasks", JSON.stringify(newTasks));
            return newTasks;
        });
    };
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

const handleSort = () => {
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();

    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  setTasks(sortedTasks);
  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
};

    const deleteTask = (id: number) => {
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.filter(task => task.id !== id);
            localStorage.setItem("tasks", JSON.stringify(updatedTasks));
            return updatedTasks;
        });
    };
    
    const clearTasks = () => {
        setTasks([]);
        localStorage.removeItem("tasks");
    };
    
    return (
        <TaskContext.Provider value={{ tasks, addTask, editTask, deleteTask }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
};

export const defaultTask: ITask = {
    id: 0,
    name: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: statusEnum.PENDING
};
