import ReactDOM from 'react-dom/client'
import React, { useState, useEffect } from 'react';
import { Item, NewItem } from './types/Item';
import { itemsApi } from './Sort/api';
import ItemDialog from './Sort/ItemDialog';
import dbUtil from './Sort/db';
import Head from '../components/Head';
let sqlDb = null;
let sortName = "asc";
let sortAge = "asc";
let sortWeight = "asc";

const CONTENT = "sort";


function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [dbItems, setDbItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<Item | undefined>();
  const [updatetime, setUpdatetime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // アイテム一覧を取得
  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await itemsApi.getAll(CONTENT);
      //console.log(data);
      //setItems(data);
      sqlDb = await dbUtil.init();
      await dbUtil.addItem(sqlDb, data);
      const target = await dbUtil.getItems(sqlDb);
      console.log(target);
      setDbItems(target)

    } catch (err) {
      setError('アイテムの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 新規作成ダイアログを開く
  const handleCreate = () => {
    setDialogMode('create');
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  // 編集ダイアログを開く
  const handleEdit = (item: Item) => {
    console.log(item);
    //item.title = item.data.title;
    //item.description = item.data.description;
    setDialogMode('edit');
    setEditingItem(item);
    setDialogOpen(true);
  };

  // アイテム保存
  const handleSave = async (itemData: NewItem) => {
    try {
      console.log(itemData);
      if (dialogMode === 'create') {
        await itemsApi.create(itemData);
      } else if (editingItem) {
        await itemsApi.update(editingItem.id, itemData);
      }
      await fetchItems();
      setError(null);
    } catch (err) {
      setError('保存に失敗しました');
    }
  };

  // アイテム削除
  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    
    try {
      await itemsApi.delete(id);
      await fetchItems();
      setError(null);
    } catch (err) {
      setError('削除に失敗しました');
    }
  };

  const sortTest = async function(){
      const target = await dbUtil.getItems(sqlDb);
      console.log(target);
  }

  const sortStart = async function(col , order){
      const target = await dbUtil.sortItem(sqlDb, col, order);
      if(col === "name"){
        if(sortName === "asc"){
          sortName = "desc"
        }else{
          sortName = "asc"
        }
      }
      if(col === "age"){
        if(sortAge === "asc"){
          sortAge = "desc"
        }else{
          sortAge = "asc"
        }
      }
      if(col === "weight"){
        if(sortWeight === "asc"){
          sortWeight = "desc"
        }else{
          sortWeight = "asc"
        }
      }
      setDbItems(target);
      console.log(target);
  }

  const handleSearch = async function(){
    try{
      console.log(searchTerm);
      const target = await dbUtil.searchItem(sqlDb, searchTerm);
      console.log(target);
      setDbItems(target);
    }catch(e){console.error(e);}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-2 pb-8">
      <Head />
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Sort.tsx</h1>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              新規作成
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="px-6 py-2 border-b border-gray-200 flex justify-between items-center">
            Search:
            <input
              type="text"
              className="border border-gray-300 rounded-md px-2 py-1"
              placeholder="Search by name"
              defaultValue={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => {handleSearch();}}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >Search</button>
          </div>

          <div className="p-6">
            {dbItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                アイテムがありません
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        name
                        <button onClick={() => { sortStart("name", sortName); }}>
                          <span className="ms-2 text-green-600">sort</span>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        age
                        <button onClick={() => { sortStart("age", sortAge); }}>
                          <span className="ms-2 text-green-600">sort</span>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        weight
                        <button onClick={() => { sortStart("weight", sortWeight); }}>
                          <span className="ms-2 text-green-600">sort</span>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dbItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.age}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.weight}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            編集
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ItemDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        item={editingItem}
        mode={dialogMode}
      />
    </div>
  );
}

export default App;

