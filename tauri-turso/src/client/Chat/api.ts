import { Item, NewItem } from '../types/Item';
import DataUtil from '../../lib/DataUtil'
const CONTENT = "chat_post";

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

  threadList: async (content: string, post_id: number): Promise<Item[]> => {
    //console.log(item);
    const resp = await DataUtil.threadlist(post_id, "chat_thread", "desc")
    console.log(resp)
    return resp
  },

  threadCreate: async (item: NewItem): Promise<Item> => {
    console.log(item);
    const ret = await DataUtil.threadCreate(
      "chat_thread", item.data, item.post_id
    )
  },

  threadDelete: async (item: NewItem): Promise<Item> => {
    console.log(item);
    const ret = await DataUtil.threadDelete("chat_thread", item.id)
    /*
    const send = {
      content : "chat_thread",
      id: item.id,
    }
    const response = await fetch("/api/chat_thread/delete", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(send),
    });
    if (!response.ok) {
      throw new Error('Failed to create item');
    }

    return response.json();
    */
  },

};