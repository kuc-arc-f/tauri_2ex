import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./input.css";

import React from "react";
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './client/Home';
import About from './client/About';
import Todo from './client/Todo';
import Sort from './client/Sort';
import Table from './client/Table';
import Table2 from './client/Table2';
import Diary from './client/Diary';
import Chat from './client/Chat';
import ItemPrice from './client/ItemPrice';
//import TaskProject from './client/TaskProject';
//import TaskItem from './client/TaskItem';

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  return(
  <div className="App">
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/todo" element={<Todo />} />
        <Route path="/sort" element={<Sort />} />
        <Route path="/table" element={<Table />} />
        <Route path="/table2" element={<Table2 />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/item_price" element={<ItemPrice />} />
      </Routes>
    </HashRouter>
  </div>
  )
}

export default App;
/*
<Route path="/task_project" element={<TaskProject />} />
<Route path="/task_item" element={<TaskItem />} />
*/