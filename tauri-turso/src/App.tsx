import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./input.css";

/*
  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }
*/
import React from "react";
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './client/Home';
import About from './client/About';
import Todo from './client/Todo';
import Sort from './client/Sort';
import Table from './client/Table';
import Table2 from './client/Table2';

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
      </Routes>
    </HashRouter>
  </div>
  )
}

export default App;
