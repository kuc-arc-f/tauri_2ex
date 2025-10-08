import { invoke } from '@tauri-apps/api/core';
 
let API_BASE = import.meta.env.VITE_API_URL;

const DataUtil = {

  create: async function(content: string, target: any): Promise<any>
  {
    try{
      const retObj = {ret: 500, data: {}}
    
      const response = await invoke('create_data', { content: content, data: target });
      console.log(response);
      return [];
    }catch(e){
      console.error(e);
      throw new Error('Error, create')

    }
  },

  update: async function(id: number , content: string, target: any): Promise<any>
  {
    try{
      const retObj = {ret: 500, data: {}}
    
      const response = await invoke('update_data', {id: id, content: content, data: target });
      console.log(response);
      return [];
    }catch(e){
      console.error(e);
      throw new Error('Error, create')

    }
  },

  list: async function(content: string, order: any): Promise<any>
  {
    try{
      const retObj = {ret: 500, data: {}}
    
      const response = await invoke('list_data', { content: content, order: order });
      //console.log(response);
      const out = [];
      if(response){
        try {
          const obj = JSON.parse(response);
          obj.forEach((element) => {
            //console.log(element.data);
            element.data = JSON.parse(element.data);
            out.push(element)
          });
          return out;
        }catch(e){
          console.log(e);
        }
      }
      return [];
    }catch(e){
      console.error(e);
      throw new Error('Error, list')
    }
  },

  delete: async function(content: string, id: number): Promise<any>
  {
    try{
      const retObj = {ret: 500, data: {}}
    
      const response = await invoke('delete_data', { content: content, id: Number(id) });
      console.log(response);
      return [];
    }catch(e){
      console.error(e);
      throw new Error('Error, delete')

    }
  },


  get: async function(path: string): Promise<any>
  {
    try{
      const apiUrl = API_BASE + path; // 外部 API の URL
      const retObj = {ret: 500, data: {}}
    
      const response = await invoke('get_external_api', {url: apiUrl});
      //console.log(response);
      if(response){
        //@ts-ignore
        const obj = JSON.parse(response);
        //console.log(obj);
        if(obj.status){
          retObj.ret = obj.status;
          console.log("status=", obj.status);
        }
        if(obj.body){
          try {
            const target = JSON.parse(obj.body);
            retObj.data = target;
          }catch(e){
            console.log(e);
            retObj.data = "";
          }
        }
        return retObj;
      }
      return [];
    }catch(e){
      console.error(e);
      throw new Error('Error, get')

    }
  },
  threadCreate: async function(content: string, data: string, post_id: number): Promise<any>
  {
    try{
      const retObj = {ret: 500, data: {}}
    
      const response = await invoke(
        'chat_create_handler', { postId: post_id, content: content, data: data 
      });
      console.log(response);
      return [];
    }catch(e){
      console.error(e);
      throw new Error('Error, create')

    }
  },

  
  threadlist: async function(post_id: number , content: string, order: any): Promise<any>
  {
    try{
      const retObj = {ret: 500, data: {}}
    
      const response = await invoke(
        'chat_list_handler', { postId: post_id, content: content, order: order }
      );
      console.log(response);
      const out = [];
      if(response){
        try {
          const obj = JSON.parse(response);
          obj.forEach((element) => {
            //console.log(element.data);
            element.data = JSON.parse(element.data);
            out.push(element)
          });
          return out;
        }catch(e){
          console.log(e);
        }
      }
      return [];
    }catch(e){
      console.error(e);
      throw new Error('Error, list')
    }
  },

  taskItemlist: async function(project_id: number , content: string, order: any): Promise<any>
  {
    try{
      const retObj = {ret: 500, data: {}}
    
      const response = await invoke(
        'task_list', { projectId: project_id, content: content, order: order }
      );
      console.log(response);
      const out = [];
      if(response){
        try {
          const obj = JSON.parse(response);
          obj.forEach((element) => {
            //console.log(element.data);
            element.data = JSON.parse(element.data);
            out.push(element)
          });
          return out;
        }catch(e){
          console.log(e);
        }
      }
      return [];
    }catch(e){
      console.error(e);
      throw new Error('Error, list')
    }
  },

  taskCreate: async function(projectId: number, content: string, target: any): Promise<any>
  {
    try{
      const retObj = {ret: 500, data: {}}
    
      const response = await invoke(
        'task_create', { projectId: projectId , content: content, data: target }
      );
      console.log(response);
      return [];
    }catch(e){
      console.error(e);
      throw new Error('Error, create')

    }
  },

  taskDelete: async function(id: number, content: string): Promise<any>
  {
    try{
      const retObj = {ret: 500, data: {}}
    
      const response = await invoke(
        'task_delete', { content: content, id: id}
      );
      console.log(response);
      return [];
    }catch(e){
      console.error(e);
      throw new Error('Error, create')

    }
  },

};
export default DataUtil;