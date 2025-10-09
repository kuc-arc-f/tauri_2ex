import Head from '../components/Head'

import React from "react";
import {useState, useEffect}  from 'react';
import { Link } from 'react-router-dom';
import LibCookie from '../lib/LibCookie'
import { useNavigate } from 'react-router-dom';
console.log("#Home.");
const AUTH_KEY = "user_auth"

function Home() {
  const navigate = useNavigate(); 

  useEffect(() => {
    const value = LibCookie.getCookie(AUTH_KEY);
    if(!value){
      navigate('/login')
    }
    console.log("uid=", value);
  }, []);

  const logout = function() {
    try{
      LibCookie.deleteCookie(AUTH_KEY)
      navigate('/login')
    }catch(e){ console.log(e) }
  }

  return (
  <>
    <Head />
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-400">Hello</h1>
      <hr className="my-2" />
      <button onClick={() => {logout()}}>[ Logout ] </button>
      <hr className="my-2" />
    </div>  
  </>    
  )
}


export default Home;
/*
*/