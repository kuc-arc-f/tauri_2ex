import { invoke } from '@tauri-apps/api'
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

};
export default DataUtil;