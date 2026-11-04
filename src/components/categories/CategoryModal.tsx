import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { CategoryItem, TransactionType } from '../../types';
import {
  AVAILABLE_CATEGORY_ICONS,
  AVAILABLE_CATEGORY_COLORS,
  renderCategoryIcon,
} from '../../utils/iconHelper';
import { CATEGORY_GROUPS } from '../../context/CategoryContext';
import { clsx } from 'clsx';
import { ArrowDown, ArrowUp, Tag, Layers, Check } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<CategoryItem, 'id'>) => Promise<void>;
  initialData?: CategoryItem | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [icon, setIcon] = useState('ShoppingBag');
  const [color, setColor] = useState('#8e8bf5');
  const [group, setGroup] = useState('Lifestyle & Fun');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setIcon(initialData.icon || 'Package');
      setColor(initialData.color || '#8e8bf5');
      setGroup(initialData.group || 'Custom');
      setDescription(initialData.description || '');
      setError(null);
    } else {
      setName('');
      setType('expense');
      setIcon('ShoppingBag');
      setColor('#8e8bf5');
      setGroup('Lifestyle & Fun');
      setDescription('');
      setError(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a category name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        type,
        icon,
        color,
        group: group.trim() || 'Custom',
        description: description.trim() || undefined,
        isCustom: true,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!initialData;

  const groupOptions = CATEGORY_GROUPS.map((g) => ({
    value: g,
    label: g,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Create New Category'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Type selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-[#101116] rounded-xl border border-slate-200/80 dark:border-[#1e2028]">
          <button
            type="button"
            disabled={isEditing} // keep type consistent when editing
            onClick={() => setType('expense')}
            className={clsx(
              'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-60',
              type === 'expense'
                ? 'bg-white dark:bg-[#20222a] text-rose-600 dark:text-[#f87171] shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Expense Category</span>
          </button>

          <button
            type="button"
            disabled={isEditing}
            onClick={() => setType('income')}
            className={clsx(
              'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-60',
              type === 'income'
                ? 'bg-white dark:bg-[#20222a] text-emerald-600 dark:text-[#22c55e] shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Income Category</span>
          </button>
        </div>

        {/* Category Name */}
        <Input
          label="Category Name"
          isRequired
          placeholder="e.g. Subscriptions, Groceries, Gym"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<Tag className="w-4 h-4" />}
        />

        {/* Group Selector */}
        <Select
          label="Category Group"
          options={groupOptions}
          value={group}
          onChange={(val) => setGroup(val)}
        />

        {/* Color Palette Picker */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Badge & Accent Color
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 sm:gap-2">
            {AVAILABLE_CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={clsx(
                  'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-transform cursor-pointer border',
                  color === c
                    ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#16171d] scale-110'
                    : 'hover:scale-105 border-transparent'
                )}
                style={{ backgroundColor: c }}
                title={c}
              >
                {color === c && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Picker Grid */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Select Icon
          </label>
          <div className="grid grid-cols-5 min-[380px]:grid-cols-6 sm:grid-cols-7 gap-1.5 sm:gap-2 max-h-36 overflow-y-auto p-1.5 bg-slate-50 dark:bg-[#121319] border border-slate-200/80 dark:border-[#22242d] rounded-xl">
            {AVAILABLE_CATEGORY_ICONS.map((iconKey) => {
              const isSelected = icon === iconKey;
              return (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => setIcon(iconKey)}
                  className={clsx(
                    'w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border',
                    isSelected
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-[#8e8bf5] border-indigo-300 dark:border-indigo-500 shadow-xs'
                      : 'bg-white dark:bg-[#1a1c26] text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-[#282a38] hover:border-indigo-200'
                  )}
                  title={iconKey}
                >
                  {renderCategoryIcon(iconKey, 'w-4 h-4 stroke-[2.2]')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Description <span className="text-[10px] text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Brief explanation for what belongs in this category..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#121319] hover:bg-slate-100/70 dark:hover:bg-[#161722] focus:bg-white dark:focus:bg-[#161722] border border-slate-200/90 dark:border-[#262835] rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:flex-1"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="lavender"
            className="w-full sm:flex-1"
            isLoading={isSubmitting}
            leftIcon={<Layers className="w-3.5 h-3.5" />}
          >
            {isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
