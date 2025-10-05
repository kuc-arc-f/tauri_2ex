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
import Todo2 from './client/Todo2';

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  return(
  <div className="App">
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/todo2" element={<Todo2 />} />
      </Routes>
    </HashRouter>
  </div>
  )
}

export default App;
