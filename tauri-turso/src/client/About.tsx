import Head from '../components/Head'
import React from "react";
import {useState, useEffect}  from 'react';
import { Link } from 'react-router-dom';
//import ApiUtil from '../lib/ApiUtil'
import DataUtil from '../lib/DataUtil'

console.log("#Home.");
const CONTENT = "todo";

function Home() {

  const test1 = async function(){
    try{
      const target =  JSON.stringify({
          title: "tit-05a2",
          body: "body-05a2"
      });
      const ret = await DataUtil.create(CONTENT, target)

      const retList = await DataUtil.list(CONTENT, "desc")
      console.log(retList)
    }catch(e){console.error(e)}
  }

  return (
  <>
    <Head />
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text">About</h1>
      <hr className="my-2" />
      <button onClick={()=>{test1()}}>[ test2 ]</button>
      <hr className="my-2" />
    </div>  
  </>    
  )
}
export default Home;
