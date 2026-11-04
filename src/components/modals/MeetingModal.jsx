import React, { useState, useEffect } from 'react';
import './Modals.css';
import {
  TotokAvatar,
  AlexandraAvatar,
  EdwinAvatar,
  IsaacAvatar,
} from '../../assets/avatars';

export const MeetingModal = ({ isOpen, onClose, reminder }) => {
  const [meetingSeconds, setMeetingSeconds] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isOpen) {
      setMeetingSeconds(0);
      timer = setInterval(() => {
        setMeetingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="meeting-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Meeting Header */}
        <div className="meeting-header">
          <div className="meeting-title-group">
            <span className="live-meeting-indicator">● LIVE</span>
            <h3 className="meeting-main-title">{reminder.title}</h3>
            <span className="meeting-timer-pill">{formatTimer(meetingSeconds)}</span>
          </div>
          <button type="button" className="modal-close-btn light-close" onClick={onClose}>✕</button>
        </div>

        {/* Video Grid Mock */}
        <div className="video-grid">
          <div className="video-cell active-speaker">
            <div className="video-avatar-holder">
              <TotokAvatar size={70} />
            </div>
            <div className="video-label-tag">
              <span>Totok Michael (You)</span>
              <span className="mic-icon-active">{isMicOn ? '🎤' : '🔇'}</span>
            </div>
          </div>

          <div className="video-cell">
            <div className="video-avatar-holder">
              <AlexandraAvatar size={70} />
            </div>
            <div className="video-label-tag">
              <span>Alexandra Deff</span>
              <span>🎤</span>
            </div>
          </div>

          <div className="video-cell">
            <div className="video-avatar-holder">
              <EdwinAvatar size={70} />
            </div>
            <div className="video-label-tag">
              <span>Edwin Adenike</span>
              <span>🎤</span>
            </div>
          </div>

          <div className="video-cell">
            <div className="video-avatar-holder">
              <IsaacAvatar size={70} />
            </div>
            <div className="video-label-tag">
              <span>Isaac Oluwatemilorun</span>
              <span>🎤</span>
            </div>
          </div>
        </div>

        {/* Controls Bar (Solid flat buttons) */}
        <div className="meeting-controls-bar">
          <button
            type="button"
            className={`meeting-btn-ctrl ${isMicOn ? 'active' : 'inactive'}`}
            onClick={() => setIsMicOn(!isMicOn)}
            title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
          >
            {isMicOn ? '🎤 Mute' : '🔇 Unmuted'}
          </button>

          <button
            type="button"
            className={`meeting-btn-ctrl ${isVideoOn ? 'active' : 'inactive'}`}
            onClick={() => setIsVideoOn(!isVideoOn)}
            title={isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
          >
            {isVideoOn ? '📹 Stop Video' : '🚫 Start Video'}
          </button>

          <button
            type="button"
            className={`meeting-btn-ctrl ${isScreenSharing ? 'active' : ''}`}
            onClick={() => setIsScreenSharing(!isScreenSharing)}
          >
            💻 {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </button>

          <button
            type="button"
            className="meeting-btn-end"
            onClick={onClose}
          >
            Leave Call
          </button>
        </div>
      </div>
    </div>
  );
};
