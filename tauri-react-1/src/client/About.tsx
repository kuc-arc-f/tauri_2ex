import Head from '../components/Head'
import React from "react";
import {useState, useEffect}  from 'react';
import { Link } from 'react-router-dom';
import ApiUtil from '../lib/ApiUtil'

console.log("#Home.");

function Home() {

  const test1 = async function(){
    try{
      const send = {
        content: "test2",
        data : JSON.stringify({
          title: "tit-04a1", body: "body-04a1"
        })
      }
      const ret = await ApiUtil.post(`/api/data/create`, send)

      const retList = await ApiUtil.get(`/api/data/list?content=test2&order=asc`)
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
