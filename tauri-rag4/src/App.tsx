import { useState } from "react";
import { marked } from 'marked';
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./input.css";

function App() {
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const chatStart = async function(){
    try{    
      setText("");
      setIsLoading(false);
      const elem = document.getElementById("input_text") as HTMLInputElement;
      let inText = "";
      if(elem){
        inText = elem.value;
      };
      console.log("inText=", inText);
      if(!inText){ return; }
      setIsLoading(true);
      const resp = await invoke("rag_search", { query: inText })
      console.log("resp=", resp)
      const json = JSON.parse(resp)
      //console.log(json)
      if(json.response){
        console.log(json.response)
        const htm = marked.parse(json.response);
        setText(htm);        
      }
      setIsLoading(false);       
    } catch(e){
      console.error(e);
    }
  }

  return (
  <div className="flex flex-col w-full max-w-4xl pt-8 mx-auto gap-4">
    <h1 className="text-2xl font-bold">RAG-Chat</h1>
    <div className="flex flex-col gap-2">
      <input
        id="input_text"
        type="text"
        className="w-full p-2 border border-gray-300 rounded dark:disabled:bg-gray-700"
        placeholder="Type your message..."
      />
      <button
        type="button"
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-700"
        onClick={()=>{chatStart()}}
      > GO
      </button>
      <div dangerouslySetInnerHTML={{ __html: text }} id="get_text_wrap"
      className="mb-2 p-2 bg-gray-100" />
      {isLoading ? (
        <div 
        className="animate-spin rounded-full h-8 w-8 mx-4 border-t-4 border-b-4 border-blue-500">
        </div>
      ): null}      
      <hr className="my-1" />
    </div>
  </div>
  );
}

export default App;
