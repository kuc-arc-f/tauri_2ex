import ReactDOM from 'react-dom/client'
import React, { useState, useEffect } from 'react';
import { Link , useSearchParams } from 'react-router-dom';
//import { Link } from 'react-router-dom';
import {itemsApi} from './TaskItem/api'
import Head from '../components/HeadHome'

const CONTENT = "task_item";
let projectId = 0;

interface Task {
  id: number;
  title: string;
  status: 'none' | 'working' | 'complete';
  start: string;
  end: string;
  content: string;
}

const TaskCRUDApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'none' | 'working' | 'complete'>('all');
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: '',
    status: 'none',
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    content: ''
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [errors, setErrors] = useState<{ title?: string }>({});


  // アイテム一覧を取得
  const fetchItems = async () => {
    try {
      projectId = searchParams.get('project_id'); // 例: URLが /page?id=123 の場合、'123'を取得
      console.log("projectId=", projectId);
      const data = await itemsApi.getAll(CONTENT, Number(projectId));
      console.log(data);
      setTasks(data);

      //getItem(itemId);      
      //setLoading(true);
    } catch (err) {
      console.error(err)
      //setError('アイテムの取得に失敗しました');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      status: 'none',
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      content: ''
    });
    setErrors({});
    setEditingTask(null);
  };

  const openDialog = (task?: Task) => {
    if (task) {
      console.log(task)
      setEditingTask(task);
      setFormData({
        title: task.data.title,
        status: task.data.status,
        start: task.data.start,
        end: task.data.end,
        content: task.data.content
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    try{
      if (!validateForm()) {
        return;
      }

      if (editingTask) {
        console.log(formData)
        console.log("id=", editingTask.id)
        await itemsApi.update(Number(editingTask.id) , formData);
        fetchItems();
      } else {
        const newTask: Task = {
          ...formData,
          id: Date.now()
        };
        console.log(newTask)
        await itemsApi.create(Number(projectId), newTask);
        fetchItems();
      }
      
      closeDialog();

    }catch(e){ console.log(e) }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('このタスクを削除しますか?')) {
      //setTasks(tasks.filter(task => task.id !== id));
      await itemsApi.delete(Number(id));
      fetchItems();
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'none': return '未着手';
      case 'working': return '作業中';
      case 'complete': return '完了';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'none': return 'bg-gray-100 text-gray-800';
      case 'working': return 'bg-blue-100 text-blue-800';
      case 'complete': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // フィルタリングされたタスクを取得
  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'all') return true;
    return task.data.status === statusFilter;
  });

  return (
  <>  
    <Head />
    <div className="min-h-screen bg-gray-50 py-2 px-6">
      
      <Link to="/task_project">
        <button type="button" 
        className="mt-0 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >Back</button>
      </Link>
      <div className="max-w-6xl mx-auto mt-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">タスク管理</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
                ステータス:
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'none' | 'working' | 'complete')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">すべて</option>
                <option value="none">未着手</option>
                <option value="working">作業中</option>
                <option value="complete">完了</option>
              </select>
            </div>         
            <button
              onClick={() => openDialog()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              新規作成
            </button>
          </div>
        </div>
        <div className="text-end me-2">
          <Link to={`/task_gantt?project_id=${projectId}`}>
            <button type="button" 
            className="mt-0 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >Gantt</button>
          </Link>

        </div>

        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">タイトル</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ステータス</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">開始日</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">終了日</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    タスクがありません
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{task.data.title}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.data.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.data.start}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.data.end}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openDialog(task)}
                        className="text-blue-600 hover:text-blue-800 mr-4 text-sm font-medium"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="border-b px-6 py-2 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingTask ? 'TaskEdit' : 'TaskCreate'}
                </h2>
                {/*
                <p className="text-sm text-gray-500 mt-1">
                  projectId: {editingTask?.id || 'new'}
                </p>
                */}
              </div>
              <button
                onClick={closeDialog}
                className="text-blue-600 hover:text-blue-800 font-medium px-4 py-1 border border-blue-600 rounded"
              >
                Back
              </button>
            </div>

            <div className="px-6 py-2 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title:
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="none"
                      checked={formData.status === 'none'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">none</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="working"
                      checked={formData.status === 'working'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">working</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="complete"
                      checked={formData.status === 'complete'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">complete</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start:
                </label>
                <input
                  type="date"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End:
                </label>
                <input
                  type="date"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content:
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-1 rounded font-medium hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
  );
};

export default TaskCRUDApp;

