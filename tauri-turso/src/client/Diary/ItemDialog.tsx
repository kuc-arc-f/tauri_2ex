import React, { useState, useEffect } from 'react';
import { Item, NewItem } from '../types/Item';

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
}) => {
  const [formData, setFormData] = useState<NewItem>({
    name: '',
    age: '',
    weight: '',
  });

  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        text: item.text,
        age: item.age,
        weight: item.weight,
      });
    } else {
      setFormData({
        text: "",
        age: "",
        weight: "",
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
    const newErrors: { title?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'タイトルは必須です';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {mode === 'create' ? 'Sortアイテム作成' : 'アイテム詳細'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              text *
            </label>
            <textarea
              disabled={true}
              rows={10}
              name="text"
              value={formData.text}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.text ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.text && (
              <p className="text-red-500 text-sm mt-1">{errors.text}</p>
            )}
          </div>

          {/* Content */}
          {/*
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              weight
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          */}
          
          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            {/*
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {mode === 'create' ? '作成' : '更新'}
            </button>
            */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemDialog;