import Head from '../components/Head'
import React from "react";
import {useState, useEffect}  from 'react';
import { Link } from 'react-router-dom';
import DataUtil from '../lib/DataUtil'
import { invoke } from '@tauri-apps/api/core';

console.log("#Home.");
const CONTENT = "todo";
const DILOG_NAME_1 ="model_name_1"
const CONFIRM_NAME_1 ="confirm_name_1"

function Home() {

  const test1 = async function(){
    try{
      const retObj = {ret: 500, data: {}}
/*

      if(typeof response !== 'number'){
        alert("Error, Login failed");
      }
*/    
    }catch(e){
      console.error("error, test1");
      console.error(e)
      alert("Error, Login failed");
    }
  }

  
  return (
  <div className="bg-gray-100 min-h-screen">
    <Head />
    <div className="container mx-auto px-4 py-8 bg-white">
      <h1 className="text-2xl font-bold mb-4 text">About</h1>
      <hr className="my-2" />
      <button onClick={()=>{test1()}}>[ test2 ]</button>
      <hr className="my-2" />
    </div>
    {/* CSS */}
    <style>{`
    dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
    }
    dialog::backdrop {
        background-color: rgba(200, 200, 200, 0.8);
    }
    `}
    </style>  
  </div>    
  )
}
export default Home;
