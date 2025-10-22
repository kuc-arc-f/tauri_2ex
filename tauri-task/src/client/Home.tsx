import Head from '../components/Head'

import React from "react";
import {useState, useEffect}  from 'react';
import { Link } from 'react-router-dom';
//import ApiUtil from '../lib/ApiUtil';

console.log("#Home.");

function Home() {

  return (
  <>
    <Head />
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-400">Hello</h1>
      <hr className="my-2" />
    </div>  
  </>    
  )
}


export default Home;
/*
*/