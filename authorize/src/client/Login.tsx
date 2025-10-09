import ReactDOM from 'react-dom/client'
import React , { useState , useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core';
import { useNavigate } from 'react-router-dom';
import LibCookie from '../lib/LibCookie'
import SignupDialog from  './Login/SignupDialog'
const AUTH_KEY = "user_auth"

function App() {
  const navigate = useNavigate(); 
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const handleSubmit = async function(e){
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    try{
      const response = await invoke(
        'user_login', { email: username , password: password}
      );
      console.log("response=", response);
      if(typeof response !== 'number'){
        alert("Error, Login failed");
      }
      LibCookie.setCookie(AUTH_KEY, response)
      navigate('/')
    }catch(e){
      console.error("error, test1");
      console.error(e)
      alert("Error, Login failed");
    }
  }

    // 新規作成ダイアログを開く
  const handleCreate = () => {
    setDialogMode('create');
    //setEditingItem(undefined);
    setDialogOpen(true);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <p className="text-gray-500 mb-6">name , password input please</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email :
            </label>
            <input
              type="text"
              id="username"
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder=""
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password :
            </label>
            <input
              type="password"
              id="password"
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder=""
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              GO
            </button>
          </div>
        </form>
        <div className="px-6 py-4">
        <button onClick={()=>{handleCreate()}}>[ signup ]</button>
        </div>

      </div>
      {/* dialog SignupDialog */}
      <SignupDialog 
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
      />

    </div>
  )

}
export default App;
