import { Item, NewItem } from '../types/Item';
import DataUtil from '../../lib/DataUtil'

const CONTENT = "sort";

export const itemsApi = {
  getAll: async (content: string): Promise<Item[]> => {
    const resp = await DataUtil.list(CONTENT, "desc")
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

  create: async (item: NewItem): Promise<Item> => {
    console.log(item);
    const target =  JSON.stringify(item);  
    console.log(target)
    const ret = await DataUtil.create(CONTENT, target)
  },

  update: async (id: number, item: Partial<NewItem>): Promise<Item> => {
    item.id = id;
    const target =  JSON.stringify(item);  
    console.log(target)
    const ret = await DataUtil.update(id, CONTENT, target)
  },

  delete: async (id: number): Promise<void> => {
    const ret = await DataUtil.delete(CONTENT, id)
  },
};