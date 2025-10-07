import Head from '../components/Head'
import React from "react";
import {useState, useEffect}  from 'react';
import { Link } from 'react-router-dom';
import DataUtil from '../lib/DataUtil'
import DialogBox from '../components/DialogBox'
import ConfirmDialog from '../components/ConfirmDialog'

console.log("#Home.");
const CONTENT = "todo";
const DILOG_NAME_1 ="model_name_1"
const CONFIRM_NAME_1 ="confirm_name_1"

function Home() {

  const test1 = async function(){
    const confirm1 = document.getElementById(CONFIRM_NAME_1);
    try{
        if(confirm1) { confirm1.showModal();}
    }catch(e){console.error(e)}
  }

  const cbFunc = async function(){
    console.log("#cbFunc");
    const dlg = document.getElementById(CONFIRM_NAME_1);
    if(dlg) {
      //@ts-ignore
      dlg.close();
    }
  }
  
  return (
  <div className="bg-gray-100 min-h-screen">
    <Head />
    <div className="container mx-auto px-4 py-8 bg-white">
      <h1 className="text-2xl font-bold mb-4 text">About</h1>
      {/*
      <hr className="my-2" />
      <button onClick={()=>{test1()}}>[ test2 ]</button>
      */}
      <hr className="my-2" />
      <DialogBox message={`OK, Check Complete!!`} name={DILOG_NAME_1} />
      <ConfirmDialog message={`OK? next`} cbFunction={cbFunc} name={CONFIRM_NAME_1} />
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
