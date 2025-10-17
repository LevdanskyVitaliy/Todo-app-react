import { useState, useEffect, useMemo } from 'react'
import TaskItem from './TaskItem';
import Calendar from 'react-calendar'
import MiniSearch from 'minisearch'
import 'react-calendar/dist/Calendar.css';

class Api {
  static #baseUrl = "http://localhost:3000"

  static async getTodos(filters={}) {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`${Api.#baseUrl}/todos?${queryString}`)
    return await response.json()
  }

  static async createTodo(todo) {
    const response = await fetch(`${Api.#baseUrl}/todos`, {
      method: "POST",
      body: JSON.stringify(todo),
    })
    return await response.json()
  }

  static async deleteTodo(id) {
     const response = await fetch(`${Api.#baseUrl}/todos/${id}`, 
      {
        method: "DELETE",
      });
      return response.ok; 
  }

  static async updateTransaction(id, updates) {
    const response = await fetch(`${Api.#baseUrl}/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    return await response.json()
  }
  
}


const  CenteredContainer = ({ children }) => {
  return (
    <div className="w-full">{children}</div>);
}

function App() {
  const [todos, setTodos] = useState([]);
  const [todoName, setTodoName] = useState("");
  const [todoDescription, setTodoDescription] = useState("");
  
  const [totalCount, setTotalCount] = useState(0)
  const [showUndoneOnly, setShowUndoneOnly ] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([])

const filter = {done : false }


  useEffect(() => {
    async function fetchTodos () {
      if(showUndoneOnly){
        const filteredTodos = await Api.getTodos(filter);
        setTodos(filteredTodos);
        setTotalCount(filteredTodos.length);
      } else{
        const allTodos = await Api.getTodos();
        setTodos(allTodos);   
      }     
    }
    fetchTodos();
  }, [showUndoneOnly])


  useEffect(() => {
    async function fetchFilteredTodos() {
      const filteredTodos = await  Api.getTodos(filter);
      setTotalCount(filteredTodos.length);
    }
    fetchFilteredTodos()
  }, []);


useEffect(() => {
    document.body.classList.add('bg-gray-900');
  }, []);

  const miniSearch = useMemo(() =>(
    new MiniSearch({
      fields: ['name'],
      storeFields: ['id', 'name', 'description', 'done', 'date'],
       searchOptions: {
          fuzzy: 0.2,         
          prefix: true       
        }
    })
      ), [todos]);

useEffect(() => {
  miniSearch.removeAll()
  miniSearch.addAll(todos)
}, [todos, miniSearch]);


  

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!todoName.trim()) return;
    const now = new Date();
    const jsonDate = now.toJSON();
    const formData = new FormData(e.target)
    const todo = {
      name: formData.get("todoName"),
      done: false,
      date: jsonDate,
      description: formData.get("todoDescription")
    }
   
    const newTodo = await Api.createTodo(todo);   
    const filteredTodos = await Api.getTodos(filter);  
    if(showUndoneOnly){
      setTodos(filteredTodos);
      setTotalCount(filteredTodos.length);
    } else{
      setTodos([newTodo, ...todos]);
      setTotalCount(filteredTodos.length);
    }
    setTodoName("");
    setTodoDescription("");
  }


  const toggleUpdate = async (id, newName) =>{ 
    const todo = todos.find(todo => todo.id === id)
    if(!todo) return;  
    setTodos(todos.map(todo => todo.id === id ? { ...todo, name: newName } : todo));
    const updates = {name: newName}
    await Api.updateTransaction(id, updates);
   
  };

  const toggleDone = async (id) =>{ 
    const todo = todos.find(todo => todo.id === id)
    if(!todo) return;
    const updatedDone = !todo.done;    
    setTodos(todos.map(todo => todo.id === id ? { ...todo, done: updatedDone } : todo));
    const updates = { done: updatedDone}
    await Api.updateTransaction(id, updates);
    const filteredTodos = await Api.getTodos(filter);
    setTotalCount(filteredTodos.length);
  };


 const DateTasks = () =>{
  return (<div className='mx-auto items-center md:m-2 m-5 '> 
      <p className="mt-auto text-md text-white md:text-xl ">
          List of tasks contain - <span className={totalCount !== 0 ? 'text-red-500' : 'text-green-500'}>{totalCount}</span> items</p>
</div> )
}
  
  const handleDelete = async (id) => {  
    const filteredTodos = await Api.getTodos(filter);
      const confirmed = window.confirm("Are you sure you want to delete a To-do?")
      if (confirmed) {  
          Api.deleteTodo(id).then((deleted) => {
            if(deleted){
               setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id))        
               setTotalCount(filteredTodos.length);
            };       
      });   
  }
 
};
 
const handleFilterToggle = () => {
    setShowUndoneOnly(prev => !prev);
}

const List = ()=>{
  const unDoneTodoList = todos.filter(todo =>
    todo.done === false
  );

  const everyotherTodoList = todos.filter(todo =>
    todo.done === true
  );




  return searchQuery ? (
    <div className='max-w-xl md:max-w-2xl w-full mr-5 mx-auto '>
    <ul className="list-none">
        {searchResults.map(todo => (
          <li key={todo.id}>
            <TaskItem
              todo={todo}
              toggleDone={toggleDone}
              toggleUpdate={toggleUpdate}
              handleDelete={handleDelete}
            />
          </li>
        ))}
      </ul> 
    </div>)   
 :(
    <div className='max-w-xl md:max-w-2xl w-full mr-5 mx-auto '>
     <ul>
     {unDoneTodoList.map((todo) => 
      <li> <TaskItem
        key = {todo.id}
        todo = {todo}
        toggleDone = {toggleDone}
        toggleUpdate={toggleUpdate}
        handleDelete = {handleDelete}
      />
      </li>)}

      {everyotherTodoList.map((todo) => 
      <li> <TaskItem
        key = {todo.id}
        todo = {todo}
        toggleDone = {toggleDone}
        toggleUpdate={toggleUpdate}
        handleDelete = {handleDelete}
      />
      </li>)}
      </ul>
    </div>
  )
}

 
return (   
<CenteredContainer  size={50}>  
<div className="md:flex gap-20 py-10 ">
   
<div className="md:w-3/8">
  <div className="md:full md:fixed flex flex-col  border-solid border-1 border-white rounded-xl mt-10 px-5 md:pb-20 mx-10">  
    <form className="my-3 flex flex-col justify-between gap-1" onSubmit={handleSubmit}>
      <input className="bg-white hover:bg-gray-100 p-5 mb-1 rounded-lg md:w-full w-2/3 mx-auto" type="text" name="todoName"
        placeholder="Enter your task"
        value={todoName}
        onChange={(e) => setTodoName(e.target.value)}/>
      <textarea
        className="bg-white hover:bg-gray-100 py-2 p-5  md:w-full w-2/3 mx-auto rounded-lg "
        rows={4} type="text" name="todoDescription" value={todoDescription} onChange={(e) => setTodoDescription(e.target.value)} placeholder="Enter your description"
      />
      <button
        className="mx-auto border-solid border-1 bg-blue-300 hover:bg-blue-200 hover:scale-95 px-5 py-3 rounded-2xl disabled:bg-gray-400"
        type="submit"
        disabled={!todoName.trim() || !todoDescription.trim()}>Create task
      </button>
    </form>   
    <DateTasks/>
    <div className='hidden md:block' style={{ width: '270px', height: '200px', margin: '0 auto'}}>
      <style>{`.react-calendar { font-size: 0.8rem; border-radius: 1rem;}`}</style>
      <Calendar />
    </div> 
  </div>
</div>


    <div className="md:w-1/2 mx-10">
    <div className='filterSS md:mt-0 mt-10 mb-1 flex justify-between items-center text-white mx-10'>
      <input
  type="text"
  className="bg-transparent border-b-1 border-b-gray-500 focus:outline-none py-2 max-w-xs"
  placeholder="Search todos..."
  value={searchQuery}
  onChange={e => {
  setSearchQuery(e.target.value)
    if (e.target.value.trim()) {
      setSearchResults(miniSearch.search(e.target.value))
    } else {
      setSearchResults([])
    }
  }}
/>
      <div className='justify-between gap-1 items-center flex'>
        <p className='font-bold'>Show Undone:</p>
        <input className='Checkbox ml-2' type="checkbox" name="filterUnDone" checked={showUndoneOnly}  onChange={handleFilterToggle}/>
      </div>
    </div>  
      <List/>
      </div>
      </div>
    </CenteredContainer>
  );
}


export default App