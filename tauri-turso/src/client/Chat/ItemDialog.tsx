import React, { useState, useEffect } from 'react';
import { Item, NewItem } from '../types/Item';
import { itemsApi } from './api';

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: NewItem) => void;
  item?: Item;
  mode: 'create' | 'edit';
}

const ItemDialog: React.FC<ItemDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  mode,
  replyArr,
  addReply,
}) => {
  const [formData, setFormData] = useState<NewItem>({
    body: '',
    //age: '',
    //weight: '',
  });
  const [reply, setReply] = useState("");

  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (item && mode === 'edit') {
      console.log("#useEffect");
      console.log(item);
      console.log(replyArr);
      setFormData({
        body: item.body,
      });
      setReply("");
    } else {
      setFormData({
        body: "",
      });
    }
    setErrors({});
  }, [item, mode, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (name === 'title' && errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const newErrors: { body?: string } = {};
    if (!formData.body.trim()) {
      newErrors.body = 'タイトルは必須です';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
    onClose();
  };

  const replySend = async function(){
    try{
      console.log("#replySend"); 
      const target = {
          body: reply,
      }
      console.log(item); 
      const send = {
        content: "chat_thread",
        post_id: item.id,
        data: JSON.stringify(target)
      }   
      const res = await itemsApi.threadCreate(send); 
      console.log(res);      
      addReply(item);  
      setReply("")

    }catch(e){console.log(e)}
  }

  const replyDelete = async function(id){
    try{
      console.log("#replyDelete=" + id); 
      const send = {
        content: "chat_thread",
        id: id,
      }   
      console.log(send); 
      const res = await itemsApi.threadDelete(send); 
      console.log(res);   
      addReply(item);  
      setReply("")

    }catch(e){console.log(e)}
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-0">
          {mode === 'create' ? 'アイテム作成' : 'アイテム詳細'}
        </h2>
        { mode === 'edit' ? (
        <div>
          <span>ID: {item.id}</span>
        </div>
        ) : null}
        <hr />
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              body *
            </label>
            <input
              type="text"
              name="body"
              disabled={mode === 'edit'}
              value={formData.body}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.body ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.body && (
              <p className="text-red-500 text-sm mt-1">{errors.body}</p>
            )}
          </div>
          <hr />
          { mode === 'edit' ? (
          <div>
            <h3 className="text-1xl">Reply</h3>
            <textarea
              placeholder="Reply input please"
              disabled={false}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className={`border border-gray-300 px-3 py-2 rounded w-full `}
            />              
            <div className="flex justify-end">
              <button type="button"
              onClick={() =>{replySend();}}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                Reply
              </button>
            </div>
            <hr className="my-2" />
            <ul>
              {replyArr.map(item => (
                <li key={item.id} className="flex items-center justify-between border-b border-gray-300 py-2">
                  <div>
                    <div>{item.data.body}
                        <button className="ms-2 text-gray-400" type="button"
                        onClick={()=> replyDelete(item.id)}
                        > [delete]</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          ) : null}

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            { mode === 'create' ? (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >作成
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemDialog;