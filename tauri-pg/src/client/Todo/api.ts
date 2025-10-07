import { Item, NewItem } from '../types/Item';
const CONTENT = "todo";
import DataUtil from '../../lib/DataUtil'

export const itemsApi = {
  getAll: async (content: string): Promise<Item[]> => {
    const resp = await DataUtil.list(CONTENT, "desc")
    console.log(resp)
    return resp
/*
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
*/
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
  },

  update: async (id: number, item: Partial<NewItem>): Promise<Item> => {
    //item.id = id;
    const target =  JSON.stringify(item);  
    console.log(target)
    const ret = await DataUtil.update(id, CONTENT, target)
  },

  delete: async (id: number): Promise<void> => {
    //const item = { id: id }
    const ret = await DataUtil.delete(CONTENT, id)
  },
};