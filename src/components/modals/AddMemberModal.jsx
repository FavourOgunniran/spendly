import React, { useState } from 'react';
import { UserPlus, User, Briefcase, Smile } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select, SelectOption } from '../ui/Select';
import { Button } from '../ui/Button';

export const AddMemberModal = ({ isOpen, onClose, onAddMember }) => {
  const [name, setName] = useState('');
  const [task, setTask] = useState('');
  const [role, setRole] = useState('Frontend Engineer');
  const [avatarKey, setAvatarKey] = useState('alexandra');

  if (!isOpen) return null;

  const roleOptions = [
    { value: 'Lead Engineer', label: 'Lead Engineer' },
    { value: 'Frontend Engineer', label: 'Frontend Engineer' },
    { value: 'Backend Developer', label: 'Backend Developer' },
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'QA Engineer', label: 'QA Engineer' },
  ];

  const avatarOptions = [
    { value: 'alexandra', label: 'Alexandra (Auburn Hair)' },
    { value: 'edwin', label: 'Edwin (Green Beanie)' },
    { value: 'isaac', label: 'Isaac (Blue Cap)' },
    { value: 'david', label: 'David (Brown Beard)' },
    { value: 'totok', label: 'Totok (Curly Hair)' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMember({
      id: `tm-${Date.now()}`,
      name: name.trim(),
      task: task.trim() || 'Working on New Feature Module',
      status: 'In Progress',
      statusType: 'in-progress',
      avatarKey,
      role,
    });

    setName('');
    setTask('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Add Team Member"
      subtitle="Invite and assign a collaborator to your team"
      icon={<UserPlus className="w-4 h-4" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <Input
          id="member-full-name"
          label="Full Name"
          placeholder="e.g. Jordan Miller"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          isRequired
          autoFocus
        />

        <Input
          id="member-current-task"
          label="Current Task"
          placeholder="e.g. Working on API Rate Limiter"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          leftIcon={<Briefcase className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <Select
            id="member-role"
            label="Role"
            options={roleOptions}
            value={role}
            onChange={(val) => setRole(val)}
          />

          <Select
            id="member-avatar-type"
            label="Avatar Character"
            options={avatarOptions}
            value={avatarKey}
            onChange={(val) => setAvatarKey(val)}
            icon={<Smile className="w-3.5 h-3.5" />}
          />
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
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
