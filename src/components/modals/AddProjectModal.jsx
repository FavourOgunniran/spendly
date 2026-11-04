import React, { useState } from 'react';
import { FolderPlus, Folder, Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Button } from '../ui/Button';

export const AddProjectModal = ({ isOpen, onClose, onAddProject }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [iconType, setIconType] = useState('dashboard');

  if (!isOpen) return null;

  const categoryOptions = [
    { value: 'Frontend', label: 'Frontend' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Product', label: 'Product' },
    { value: 'Performance', label: 'Performance' },
    { value: 'QA', label: 'QA / Testing' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddProject({
      id: `p-${Date.now()}`,
      title: title.trim(),
      dueDate: dueDate || 'Dec 15, 2024',
      iconType,
      category,
      progress: 10,
    });

    setTitle('');
    setDueDate('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Create New Project"
      subtitle="Define milestones and track delivery progress"
      icon={<FolderPlus className="w-4 h-4" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <Input
          id="project-title"
          label="Project Name"
          placeholder="e.g. Mobile Design System"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          leftIcon={<Folder className="w-4 h-4" />}
          isRequired
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <Select
            id="project-category"
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={(val) => setCategory(val)}
          />

          <Input
            id="project-due-date"
            label="Due Date"
            placeholder="e.g. Dec 12, 2024"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Icon Identifier
          </label>
          <div className="flex flex-wrap gap-2">
            {['dashboard', 'api', 'flow', 'speed', 'testing'].map((type) => {
              const isSelected = iconType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setIconType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#8e8bf5] text-[#1d1760] shadow-sm font-extrabold'
                      : 'bg-slate-100 dark:bg-[#20222a] hover:bg-slate-200 dark:hover:bg-[#282b39] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-[#22242d]">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="lavender"
            className="flex-1"
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
