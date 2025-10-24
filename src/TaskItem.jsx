import { FaTrash } from 'react-icons/fa';
import { FaPencilAlt } from 'react-icons/fa';
import React, { useState, memo } from 'react';



const  TaskItem = memo(function TaskItem({todo, toggleDone, toggleUpdate, handleDelete}){
const [isExpanded, setIsExpanded] = useState(false);
const [textEdit, setTextEdit] = useState('');
const [isEditing, setIsEditing] = useState(false);


const startEditing = () => {
  setTextEdit(todo.name); 
  setIsEditing(true);
};


const handleNameUpdate =() =>{
  toggleUpdate(todo.id, textEdit);
  setIsEditing(false)  
};


const TodoName = () =>{
  return isEditing ? (
   <input type="text" name="textEdit" value={textEdit} 
   onChange={(e)=> setTextEdit(e.target.value)}
   onClick={(e) => e.stopPropagation()}
   onBlur={handleNameUpdate}
   onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.target.blur(); 
      handleNameUpdate();
    }
  }}
  className="ml-2 text-normal max-w-sm"
  autoFocus
  />
) : (<span className={`ml-2 ${todo.done ? 'line-through ' : 'text-normal' } overflow-scroll whitespace-break-spaces max-w-sm `}>
  {todo.name}
  </span>
  )
}


return(
      <div key={todo.id} className={`group ${todo.done ? 'bg-gray-400 ' : 'bg-white'} md:px-6 px-4 py-5 mt-3 rounded-2xl flex flex-col hover:scale-105 gap-1 max-w-2xl w-full transition-all duration-300`}  
        style={{height: isExpanded ? '150px' : '70px', cursor: 'pointer'}}  onClick={(e) => {e.stopPropagation(); setIsExpanded(prev => !prev)} } >


    <div className="flex  w-full"> 
      <input className='Checkbox ml-2 ' type="checkbox" checked={todo.done} onChange={() =>  toggleDone(todo.id)} onClick={(e)=> e.stopPropagation()}/>
      <TodoName/>
       <span className="text-gray-700 text-xs ml-auto  mr-2">{new Date(todo.date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      })}</span>
        <button className="ml-auto hidden group-hover:inline-block" onClick={(e) =>{e.stopPropagation(); handleDelete(todo.id)}}> <FaTrash /></button>
        <button className="ml-2 hidden group-hover:inline-block" onClick={(e) =>{e.stopPropagation(); startEditing();}}> <FaPencilAlt /></button>
          <span className="mx-2">{todo.done ? "✅" : "🌶"}</span> 
      </div>


      {isExpanded && 
      (
      <div className="md:mt-2 ml-7 flex-col items-center text-sm text-gray-700">
         <hr className='m-1 solid bg-gray-700 '></hr>
      <textarea readOnly
  rows={2}
  className={`w-full max-w-xl p-1 py-2 rounded-lg text-gray-700 resize-none whitespace-normal`}>{todo.description}</textarea>
    </div>
          )}
          </div>
    )
});


export default TaskItem;