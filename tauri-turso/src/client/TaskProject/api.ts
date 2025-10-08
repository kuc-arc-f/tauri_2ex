import { Item, NewItem } from '../types/Item';
import DataUtil from '../../lib/DataUtil'
const CONTENT = "task_project";

export const itemsApi = {
  getAll: async (content: string): Promise<Item[]> => {
    const resp = await DataUtil.list(CONTENT, "desc")
    console.log(resp)
    return resp
    //console.log(json);
  },

  getById: async (id: number): Promise<Item> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch item');
    }
    return response.json();
  },

  create: async (item: NewItem): Promise<Item> => {
    console.log(item);
    const target =  JSON.stringify(item);  
    console.log(target)
    const ret = await DataUtil.create(CONTENT, target)    
    console.log(ret)
  },

  update: async (id: number, item: Partial<NewItem>): Promise<Item> => {
    const target =  JSON.stringify(item);  
    console.log(target)
    const ret = await DataUtil.update(id, CONTENT, target)
  },

  delete: async (id: number): Promise<void> => {
    const item = {
      content : CONTENT,
      id: id 
    }
    const response = await fetch(`/api/data/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
  },
};