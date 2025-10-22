import { Item, NewItem } from '../types/Item';
import DataUtil from '../../lib/DataUtil'

const CONTENT = "task_item";

export const itemsApi = {
  getAll: async (content: string, projectId:number): Promise<Item[]> => {
    const resp = await DataUtil.taskItemlist(projectId, CONTENT, "desc")
    console.log(resp)
    return resp 
    /*
    let dataValue = {};
    const newItems = [];
    json.data.forEach((element) => {
      try{
        dataValue = JSON.parse(element.data);
        element.data = dataValue;
      }catch(e){
        console.error(e);
      }
      newItems.push(element);
    });    
    return newItems;
    */   
  },

  getById: async (id: number): Promise<Item> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch item');
    }
    return response.json();
  },

  create: async (project_id: number, item: NewItem): Promise<Item> => {
    console.log(item);
    const target =  JSON.stringify(item);  
    console.log(target)
    const ret = await DataUtil.taskCreate(project_id, CONTENT, target)

  },

  update: async (id: number, item: Partial<NewItem>): Promise<Item> => {
    item.id = id;
    const target =  JSON.stringify(item);  
    console.log(target)
    const ret = await DataUtil.update(id, CONTENT, target)

    /*
    const send = {
      id: Number(id),
      content : CONTENT,
      data : JSON.stringify(item) 
    }
    const response = await fetch(`/api/task_item/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(send),
    });
    if (!response.ok) {
      throw new Error('Failed to update item');
    }
    return response.json();
    */
  },

  delete: async (id: number): Promise<void> => {
    const resp = await DataUtil.taskDelete(id, CONTENT)
    console.log(resp)
    return resp     
  },
};