import ReactDOM from 'react-dom/client'
import React, { useState, useEffect } from 'react';
import { Item, NewItem } from './types/Item';
import { itemsApi } from './Diary/api';
import ItemDialog from './Diary/ItemDialog';
import dbUtil from './Diary/db';

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import Head from '../components/Head';
let sqlDb = null;
let sortName = "asc";
let sortAge = "asc";
let sortWeight = "asc";
const CONTENT = "mcp_diary";

type Person = {
  id: number;
  name: string;
  age: number;
  weight: number;
};

const defaultData: Person[] = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  age: 20 + (i % 15),
  weight: i + 1,
}));

export default function App() {
  const [data] = React.useState(() => [...defaultData]);
  const [dbItems, setDbItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<Item | undefined>();
  const [updatetime, setUpdatetime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");    
  //console.log(data);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await itemsApi.getAll(CONTENT);
      setDbItems(data);
      /*
      sqlDb = await dbUtil.init();
      await dbUtil.addItem(sqlDb, data);
      const target = await dbUtil.getItems(sqlDb);      
      console.log(target);
      */

    } catch (err) {
      setError('アイテムの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);
  
  const columns: ColumnDef<Person>[] = [
    { 
      header: "ID", 
      cell: ({ row }) => (
        <div className="rounded p-2 bg-white">
          <h3 className="text-1xl font-bold">{row.original.data.text_list}</h3>
          {/*
          <span className="ms-2">Age :{row.original.age}</span>
          <span className="ms-2">Weight :{row.original.weight}</span>
          <br />
          */}
          <span className="ms-2">Id: {row.original.id}</span>
          <span className="ms-2">
            <button
              onClick={() => handleEdit(row.original)}
              className="text-indigo-600 hover:text-indigo-900 mr-4"
            >
              [ Show ]
            </button>            
            <button onClick={() => handleDelete(row.original.id)}
              className="text-red-400">[ delete ]</button>
          </span>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: dbItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // ページネーション追加
  });

  // 新規作成ダイアログを開く
  const handleCreate = () => {
    setDialogMode('create');
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  // 編集ダイアログを開く
  const handleEdit = (item: Item) => {
    console.log(item);
    item.text = item.data.text;
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

  return (
    <div className="min-h-screen bg-gray-100 pt-2 pb-8">
      <Head />
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow pb-8">
          {/*  */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Diary</h1>
          </div>
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <table className="border border-gray-300 bg-gray-100 w-full pb-4">
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="pt-2 px-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
            {/* ページネーション UI */}
          <div className="flex items-center gap-2 mt-4">
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ← 前へ
            </button>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              次へ →
            </button>
            <span className="ml-2">
              Page{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </strong>
            </span>
            <select
              className="ml-2 border p-1"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} rows
                </option>
              ))}
            </select>
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
