import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./input.css";
import React from "react";
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './client/Home';
import About from './client/About';
import Todo from './client/Todo';

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
      </Routes>
    </HashRouter>
  </div>
  )
}

export default App;