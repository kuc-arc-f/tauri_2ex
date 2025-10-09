import React, { useState, useEffect } from 'react';
import { Item, NewItem } from '../types/Item';
import { invoke } from '@tauri-apps/api/core';

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: NewItem) => void;
  item?: Item;
  mode: 'create' | 'edit';
}

const Signup: React.FC<ItemDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  mode,
}) => {
  const [formData, setFormData] = useState<NewItem>({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        title: item.title,
        body: item.body,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const newErrors: { name?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'nameは必須です';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'emailは必須です';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'passwordは必須です';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    //
    const response = await invoke(
      'user_create', 
      { name: formData.name, email: formData.email , password: formData.password }
    );    
    //onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {mode === 'create' ? 'Signup' : 'アイテム編集'}
        </h2>
        
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}

          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {mode === 'create' ? '作成' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;