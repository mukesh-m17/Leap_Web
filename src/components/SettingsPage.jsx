import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  
  const [settings, setSettings] = useState({
    warningThreshold: 300,
    criticalThreshold: 400,
    autoRefresh: true,
    refreshInterval: 5,
    emailNotifications: true,
    smsNotifications: false,
    soundAlerts: true,
    sensorSensitivity: "medium",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("gasGuardSettings", JSON.stringify(settings));
      setIsSaving(false);
      setHasChanges(false);
      alert("✓ " + t('saveChanges') + " " + (language === 'ta' ? 'வெற்றிகரமாக!' : 'successful!'));
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm(t('resetToDefault') + "?")) {
      const defaultSettings = {
        warningThreshold: 300,
        criticalThreshold: 400,
        autoRefresh: true,
        refreshInterval: 5,
        emailNotifications: true,
        smsNotifications: false,
        soundAlerts: true,
        sensorSensitivity: "medium",
      };
      setSettings(defaultSettings);
      setHasChanges(true);
      alert("✓ " + (language === 'ta' ? 'அமைப்புகள் மீட்டமைக்கப்பட்டன!' : 'Settings reset!'));
    }
  };

  const testNotification = (type) => {
    const messages = {
      email: language === 'ta' 
        ? 'சோதனை மின்னஞ்சல் அனுப்பப்பட்டது!' 
        : 'Test email sent!',
      sms: language === 'ta' 
        ? 'சோதனை SMS அனுப்பப்பட்டது!' 
        : 'Test SMS sent!',
      sound: language === 'ta' 
        ? '🔊 சோதனை ஒலி இயக்கப்பட்டது!' 
        : '🔊 Test sound played!'
    };
    alert(messages[type] || messages.sound);
  };

  return (
    <div className="page-content settings-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{t('systemSettings')}</h2>
          <p className="page-subtitle">{t('configureParameters')}</p>
        </div>
        <div className="page-actions">
          <button className="page-action-btn" onClick={handleReset}>
            {t('resetToDefault')}
          </button>
          <button
            className={`page-action-btn primary ${!hasChanges ? "disabled" : ""}`}
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <span className="btn-spinner"></span>
                {t('saving')}
              </>
            ) : (
              <>💾 {t('saveChanges')}</>
            )}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        {/* Thresholds */}
        <div className="panel settings-section">
          <h3 className="section-title">
            <span className="section-icon">⚙️</span>
            {t('detectionThresholds')}
          </h3>
          <div className="settings-group">
            <div className="setting-item">
              <label className="setting-label">
                {t('warningThreshold')}
                <span className="setting-hint">{t('alertWhenExceeds')}</span>
              </label>
              <input
                type="number"
                className="setting-input"
                min="100"
                max="500"
                value={settings.warningThreshold}
                onChange={(e) =>
                  handleChange("warningThreshold", Number(e.target.value))
                }
              />
            </div>
            <div className="setting-item">
              <label className="setting-label">
                {t('criticalThreshold')}
                <span className="setting-hint">{t('emergencyAlertThreshold')}</span>
              </label>
              <input
                type="number"
                className="setting-input"
                min="200"
                max="1000"
                value={settings.criticalThreshold}
                onChange={(e) =>
                  handleChange("criticalThreshold", Number(e.target.value))
                }
              />
            </div>
            <div className="setting-item">
              <label className="setting-label">
                {t('sensorSensitivity')}
                <span className="setting-hint">{t('adjustSensorSensitivity')}</span>
              </label>
              <select
                className="setting-select"
                value={settings.sensorSensitivity}
                onChange={(e) => handleChange("sensorSensitivity", e.target.value)}
              >
                <option value="low">{language === 'ta' ? 'குறைவு' : 'Low'}</option>
                <option value="medium">{language === 'ta' ? 'நடுத்தர' : 'Medium'}</option>
                <option value="high">{language === 'ta' ? 'அதிக' : 'High'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Collection */}
        <div className="panel settings-section">
          <h3 className="section-title">
            <span className="section-icon">📊</span>
            {t('dataCollection')}
          </h3>
          <div className="settings-group">
            <div className="setting-item">
              <label className="setting-label">
                {t('autoRefresh')}
                <span className="setting-hint">{t('automaticallyUpdate')}</span>
              </label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => handleChange("autoRefresh", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <label className="setting-label">
                {t('refreshInterval')}
                <span className="setting-hint">{t('howOftenFetch')}</span>
              </label>
              <select
                className="setting-select"
                value={settings.refreshInterval}
                onChange={(e) =>
                  handleChange("refreshInterval", Number(e.target.value))
                }
                disabled={!settings.autoRefresh}
              >
                <option value={1}>1 {language === 'ta' ? 'விநாடி' : 'second'}</option>
                <option value={5}>5 {language === 'ta' ? 'விநாடிகள்' : 'seconds'}</option>
                <option value={10}>10 {language === 'ta' ? 'விநாடிகள்' : 'seconds'}</option>
                <option value={30}>30 {language === 'ta' ? 'விநாடிகள்' : 'seconds'}</option>
                <option value={60}>1 {language === 'ta' ? 'நிமிடம்' : 'minute'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="panel settings-section span-2">
          <h3 className="section-title">
            <span className="section-icon">🔔</span>
            {t('notificationPreferences')}
          </h3>
          <div className="settings-group">
            <div className="setting-item">
              <label className="setting-label">
                {t('emailNotifications')}
                <span className="setting-hint">{t('receiveAlertsEmail')}</span>
              </label>
              <div className="setting-actions">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      handleChange("emailNotifications", e.target.checked)
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
                <button
                  className="test-btn"
                  onClick={() => testNotification("email")}
                  disabled={!settings.emailNotifications}
                >
                  {language === 'ta' ? 'சோதனை' : 'Test'}
                </button>
              </div>
            </div>
            <div className="setting-item">
              <label className="setting-label">
                {t('smsNotifications')}
                <span className="setting-hint">{t('receiveCriticalSMS')}</span>
              </label>
              <div className="setting-actions">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) =>
                      handleChange("smsNotifications", e.target.checked)
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
                <button
                  className="test-btn"
                  onClick={() => testNotification("sms")}
                  disabled={!settings.smsNotifications}
                >
                  {language === 'ta' ? 'சோதனை' : 'Test'}
                </button>
              </div>
            </div>
            <div className="setting-item">
              <label className="setting-label">
                {t('soundAlerts')}
                <span className="setting-hint">{t('playSoundCritical')}</span>
              </label>
              <div className="setting-actions">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.soundAlerts}
                    onChange={(e) => handleChange("soundAlerts", e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <button
                  className="test-btn"
                  onClick={() => testNotification("sound")}
                  disabled={!settings.soundAlerts}
                >
                  {language === 'ta' ? 'சோதனை' : 'Test'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="panel settings-section">
          <h3 className="section-title">
            <span className="section-icon">🎨</span>
            {t('appearance')}
          </h3>
          <div className="settings-group">
            <div className="setting-item">
              <label className="setting-label">
                {t('darkMode')}
                <span className="setting-hint">{t('useDarkTheme')}</span>
              </label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <label className="setting-label">
                {t('language')}
                <span className="setting-hint">{t('interfaceLanguage')}</span>
              </label>
              <select
                className="setting-select"
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="panel settings-section">
          <h3 className="section-title">
            <span className="section-icon">ℹ️</span>
            {t('systemInformation')}
          </h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-key">{t('sensorId')}:</span>
              <span className="info-value">3254332</span>
            </div>
            <div className="info-item">
              <span className="info-key">{t('firmwareVersion')}:</span>
              <span className="info-value">v3.2.1</span>
            </div>
            <div className="info-item">
              <span className="info-key">{t('lastCalibration')}:</span>
              <span className="info-value">2024-01-10</span>
            </div>
            <div className="info-item">
              <span className="info-key">{t('uptime')}:</span>
              <span className="info-value">45 {language === 'ta' ? 'நாட்கள்' : 'days'}</span>
            </div>
          </div>
          <button
            className="calibrate-btn"
            onClick={() => alert((language === 'ta' ? 'அளவுத்திருத்தம் தொடங்கியது...' : 'Calibration started...'))}
          >
            🔧 {t('calibrateSensor')}
          </button>
        </div>
      </div>
    </div>
  );
}