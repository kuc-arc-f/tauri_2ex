import { Item, NewItem } from '../types/Item';
const CONTENT = "todo2";
import ApiUtil from '../../lib/ApiUtil'

//const API_BASE = ''; 

export const itemsApi = {
  getAll: async (content: string): Promise<Item[]> => {
    const resp = await ApiUtil.get(`/api/data/list?content=${CONTENT}&order=desc`)
    console.log(resp);
     //return []
    let dataValue = {};
    const newItems = [];
    resp.data.data.forEach((element) => {
      console.log(element.data);
      try{
        dataValue = JSON.parse(element.data);
        element.data = dataValue;
      }catch(e){
        console.error(e);
      }
      newItems.push(element);
    });    
    console.log(newItems);    
    return newItems;
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
    const send = {
      content: CONTENT,
      data: JSON.stringify(item)
    }
    const resp = await ApiUtil.post(`/api/data/create`, send)
    console.log(resp)
  },

  update: async (id: number, item: Partial<NewItem>): Promise<Item> => {
    item.id = id;
    const send = {
      content: CONTENT,
      id: id,
      data: JSON.stringify(item), 
    }    
    const resp = await ApiUtil.post(`/api/data/update`, send)
    console.log(resp)
/*
    const response = await fetch(`/api/data/update`, {
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
    const item = { id: id }
    const send = {
      content: CONTENT,
      id: id, 
    }
    const resp = await ApiUtil.post(`/api/data/delete`, send)
    console.log(resp)
  },
};