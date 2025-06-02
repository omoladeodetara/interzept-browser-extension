import React, { useState, useEffect } from 'react';

const Options: React.FC = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    // Add other settings as needed
  });

  useEffect(() => {
    // Load settings from chrome.storage when component mounts
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({ settings });
  };

  return (
    <div className="options-container">
      <h1>Interzept Extension Settings</h1>
      
      <div className="option-group">
        <label>
          <input 
            type="checkbox" 
            checked={settings.enabled} 
            onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
          />
          Enable Interzept
        </label>
      </div>
      
      {/* Add more settings options here */}
      
      <button onClick={saveSettings} className="save-button">
        Save Settings
      </button>
    </div>
  );
};

export default Options;
