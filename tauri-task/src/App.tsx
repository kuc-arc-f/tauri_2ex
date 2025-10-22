import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
//import "./App.css";
import "./input.css";

import React from "react";
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './client/Home';
import About from './client/About';
import TaskProject from './client/TaskProject';
import TaskItem from './client/TaskItem'
import TaskGantt from './client/TaskGantt'

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  return(
  <div className="App">
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/task_project" element={<TaskProject />} />
        <Route path="/task_item" element={<TaskItem />} />
        <Route path="/task_gantt" element={<TaskGantt />} />
      </Routes>
    </HashRouter>
  </div>
  )
}

export default App;
