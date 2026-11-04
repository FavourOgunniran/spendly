import React, { useState, useEffect } from 'react';
import './Modals.css';
import { SearchIcon } from '../icons/Icons';

export const CommandPalette = ({
  isOpen,
  onClose,
  projects,
  teamMembers,
  onSelectProject,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMembers = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.task.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-backdrop command-palette-backdrop" onClick={onClose}>
      <div className="command-palette-box" onClick={(e) => e.stopPropagation()}>
        <div className="command-search-header">
          <SearchIcon size={18} color="#154432" />
          <input
            type="text"
            className="command-search-input"
            placeholder="Search projects, team members, tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <span className="command-esc-tag">ESC</span>
        </div>

        <div className="command-results-scroll">
          {/* Projects Group */}
          <div className="command-section">
            <span className="command-section-label">PROJECTS</span>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="command-result-item"
                  onClick={() => {
                    onSelectProject?.(p);
                    onClose();
                  }}
                >
                  <div className="result-item-left">
                    <span className="result-item-badge">{p.category}</span>
                    <span className="result-item-title">{p.title}</span>
                  </div>
                  <span className="result-item-meta">Due: {p.dueDate}</span>
                </div>
              ))
            ) : (
              <p className="no-results-text">No matching projects</p>
            )}
          </div>

          {/* Team Members Group */}
          <div className="command-section">
            <span className="command-section-label">TEAM MEMBERS</span>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((m) => (
                <div key={m.id} className="command-result-item">
                  <div className="result-item-left">
                    <span className="result-item-avatar-initial">
                      {m.name.charAt(0)}
                    </span>
                    <div className="result-member-text">
                      <span className="result-item-title">{m.name}</span>
                      <span className="result-member-sub">{m.task}</span>
                    </div>
                  </div>
                  <span className={`status-pill status-${m.statusType}`}>
                    {m.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-results-text">No matching team members</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
