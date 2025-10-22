import { invoke } from '@tauri-apps/api'
let API_BASE = import.meta.env.VITE_API_URL;

const ApiUtil = {

  post: async function(path: string, item: any): Promise<any>
  {
    try{
      const apiUrl = API_BASE + path; // 外部 API の URL
      const postData = item;
      const retObj = {ret: 500, data: {}}
    
      const response = await invoke('post_external_api', { url: apiUrl, data: JSON.stringify(postData) });
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
      throw new Error('Error, post')

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
export default ApiUtil;