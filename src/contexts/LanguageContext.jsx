import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    analytics: "Analytics",
    history: "History",
    settings: "Settings",
    alerts: "Alerts",
    reports: "Reports",
    
    // Dashboard
    monitoringSystem: "MONITORING SYSTEM v3.0",
    smartGas: "Smart Gas",
    safetyDashboard: "Safety Dashboard",
    realTimeLPG: "Real-time LPG Detection & Analysis",
    live: "LIVE",
    offline: "OFFLINE",
    cylinderMonitor: "Cylinder Monitor",
    fillLevel: "Fill Level",
    status: "Status",
    currentGasLevel: "Current Gas Level",
    vsLastReading: "vs last reading",
    dangerThreshold: "Danger Threshold",
    peakValue: "Peak Value",
    average: "Average",
    minimum: "Minimum",
    gasConcentration: "Gas Concentration Timeline",
    lastReadings: "Last 20 readings · 5s interval",
    safeRange: "Safe Range",
    warning: "Warning",
    critical: "Critical",
    sensorId: "Sensor ID",
    
    // Status
    normal: "NORMAL",
    elevated: "ELEVATED",
    criticalStatus: "CRITICAL",
    
    // Analytics
    analyticsTitle: "Analytics Dashboard",
    analyticsSubtitle: "Comprehensive gas monitoring insights and trends",
    exportData: "Export Data",
    generateReport: "Generate Report",
    weeklyOverview: "Weekly Overview",
    statusDistribution: "Status Distribution",
    trendAnalysis: "24-Hour Trend Analysis",
    avgDaily: "Avg. Daily",
    warnings: "Warnings",
    criticalEvents: "Critical Events",
    uptime: "Uptime",
    
    // History
    eventHistory: "Event History",
    completeLog: "Complete log of all gas monitoring events",
    allEvents: "All Events",
    exportFiltered: "Export Filtered",
    clearAll: "Clear All",
    searchEvents: "Search events...",
    newestFirst: "Newest First",
    oldestFirst: "Oldest First",
    timestamp: "Timestamp",
    gasLevel: "Gas Level",
    eventDescription: "Event Description",
    actions: "Actions",
    view: "View",
    export: "Export",
    delete: "Delete",
    
    // Settings
    systemSettings: "System Settings",
    configureParameters: "Configure monitoring parameters and alerts",
    resetToDefault: "Reset to Default",
    saveChanges: "Save Changes",
    saving: "Saving...",
    detectionThresholds: "Detection Thresholds",
    warningThreshold: "Warning Threshold (ppm)",
    criticalThreshold: "Critical Threshold (ppm)",
    sensorSensitivity: "Sensor Sensitivity",
    dataCollection: "Data Collection",
    autoRefresh: "Auto Refresh",
    refreshInterval: "Refresh Interval (seconds)",
    notificationPreferences: "Notification Preferences",
    emailNotifications: "Email Notifications",
    smsNotifications: "SMS Notifications",
    soundAlerts: "Sound Alerts",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    language: "Language",
    systemInformation: "System Information",
    firmwareVersion: "Firmware Version",
    lastCalibration: "Last Calibration",
    calibrateSensor: "Calibrate Sensor",
    
    // Alerts
    alertCenter: "Alert Center",
    manageNotifications: "Manage and review system notifications",
    markAllAsRead: "Mark All as Read",
    unread: "Unread",
    viewDetails: "View Details",
    markAsRead: "Mark as Read",
    dismiss: "Dismiss",
    
    // Reports
    reportsAnalytics: "Reports & Analytics",
    generateDownload: "Generate and download monitoring reports",
    generateCustomReport: "Generate Custom Report",
    reportType: "Report Type",
    dateRange: "Date Range",
    format: "Format",
    generatedReports: "Generated Reports",
    noReportsYet: "No reports generated yet",
    generateFirstReport: "Generate your first report to get started",
    
    // Messages
    alertWhenExceeds: "Alert when gas exceeds this level",
    emergencyAlertThreshold: "Emergency alert threshold",
    adjustSensorSensitivity: "Adjust sensor detection sensitivity",
    automaticallyUpdate: "Automatically update readings",
    howOftenFetch: "How often to fetch new data",
    receiveAlertsEmail: "Receive alerts via email",
    receiveCriticalSMS: "Receive critical alerts via SMS",
    playSoundCritical: "Play sound on critical events",
    useDarkTheme: "Use dark theme",
    interfaceLanguage: "Interface language",
    
    // Days
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
    
    // Report Types
    dailySummary: "Daily Summary",
    weeklyAnalysis: "Weekly Analysis",
    monthlyReport: "Monthly Report",
    customRange: "Custom Range",
  },
  
  ta: {
    // Navigation
    dashboard: "டாஷ்போர்டு",
    analytics: "பகுப்பாய்வு",
    history: "வரலாறு",
    settings: "அமைப்புகள்",
    alerts: "எச்சரிக்கைகள்",
    reports: "அறிக்கைகள்",
    
    // Dashboard
    monitoringSystem: "கண்காணிப்பு அமைப்பு v3.0",
    smartGas: "ஸ்மார்ட் எரிவாயு",
    safetyDashboard: "பாதுகாப்பு டாஷ்போர்டு",
    realTimeLPG: "நேரடி எல்பிஜி கண்டறிதல் & பகுப்பாய்வு",
    live: "நேரலை",
    offline: "ஆஃப்லைன்",
    cylinderMonitor: "சிலிண்டர் கண்காணிப்பு",
    fillLevel: "நிரப்பு நிலை",
    status: "நிலை",
    currentGasLevel: "தற்போதைய வாயு அளவு",
    vsLastReading: "கடைசி வாசிப்பு விகிதம்",
    dangerThreshold: "ஆபத்து எல்லை",
    peakValue: "உச்ச மதிப்பு",
    average: "சராசரி",
    minimum: "குறைந்தபட்சம்",
    gasConcentration: "வாயு செறிவு காலவரிசை",
    lastReadings: "கடைசி 20 வாசிப்புகள் · 5 வி இடைவெளி",
    safeRange: "பாதுகாப்பான வரம்பு",
    warning: "எச்சரிக்கை",
    critical: "முக்கியமான",
    sensorId: "சென்சார் ஐடி",
    
    // Status
    normal: "இயல்பானது",
    elevated: "உயர்த்தப்பட்டது",
    criticalStatus: "முக்கியமான",
    
    // Analytics
    analyticsTitle: "பகுப்பாய்வு டாஷ்போர்டு",
    analyticsSubtitle: "விரிவான வாயு கண்காணிப்பு நுண்ணறிவு மற்றும் போக்குகள்",
    exportData: "தரவை ஏற்றுமதி",
    generateReport: "அறிக்கை உருவாக்கு",
    weeklyOverview: "வாராந்திர கண்ணோட்டம்",
    statusDistribution: "நிலை விநியோகம்",
    trendAnalysis: "24-மணி நேர போக்கு பகுப்பாய்வு",
    avgDaily: "சராசரி தினசரி",
    warnings: "எச்சரிக்கைகள்",
    criticalEvents: "முக்கிய நிகழ்வுகள்",
    uptime: "இயக்க நேரம்",
    
    // History
    eventHistory: "நிகழ்வு வரலாறு",
    completeLog: "அனைத்து வாயு கண்காணிப்பு நிகழ்வுகளின் முழுமையான பதிவு",
    allEvents: "அனைத்து நிகழ்வுகள்",
    exportFiltered: "வடிகட்டப்பட்டதை ஏற்றுமதி",
    clearAll: "அனைத்தையும் அழி",
    searchEvents: "நிகழ்வுகளைத் தேடு...",
    newestFirst: "புதியது முதலில்",
    oldestFirst: "பழையது முதலில்",
    timestamp: "நேர முத்திரை",
    gasLevel: "வாயு அளவு",
    eventDescription: "நிகழ்வு விளக்கம்",
    actions: "செயல்கள்",
    view: "பார்",
    export: "ஏற்றுமதி",
    delete: "நீக்கு",
    
    // Settings
    systemSettings: "கணினி அமைப்புகள்",
    configureParameters: "கண்காணிப்பு அளவுருக்கள் மற்றும் எச்சரிக்கைகளை உள்ளமை",
    resetToDefault: "இயல்புநிலைக்கு மீட்டமை",
    saveChanges: "மாற்றங்களைச் சேமி",
    saving: "சேமிக்கப்படுகிறது...",
    detectionThresholds: "கண்டறிதல் எல்லைகள்",
    warningThreshold: "எச்சரிக்கை எல்லை (ppm)",
    criticalThreshold: "முக்கிய எல்லை (ppm)",
    sensorSensitivity: "சென்சார் உணர்திறன்",
    dataCollection: "தரவு சேகரிப்பு",
    autoRefresh: "தானியங்கு புதுப்பிப்பு",
    refreshInterval: "புதுப்பிப்பு இடைவெளி (விநாடிகள்)",
    notificationPreferences: "அறிவிப்பு விருப்பத்தேர்வுகள்",
    emailNotifications: "மின்னஞ்சல் அறிவிப்புகள்",
    smsNotifications: "SMS அறிவிப்புகள்",
    soundAlerts: "ஒலி எச்சரிக்கைகள்",
    appearance: "தோற்றம்",
    darkMode: "இருண்ட பயன்முறை",
    language: "மொழி",
    systemInformation: "கணினி தகவல்",
    firmwareVersion: "ஃபார்ம்வேர் பதிப்பு",
    lastCalibration: "கடைசி அளவுத்திருத்தம்",
    calibrateSensor: "சென்சார் அளவுத்திருத்தம்",
    
    // Alerts
    alertCenter: "எச்சரிக்கை மையம்",
    manageNotifications: "கணினி அறிவிப்புகளை நிர்வகி மற்றும் மதிப்பாய்வு",
    markAllAsRead: "அனைத்தையும் படித்ததாகக் குறி",
    unread: "படிக்கப்படாதது",
    viewDetails: "விவரங்களைப் பார்",
    markAsRead: "படித்ததாகக் குறி",
    dismiss: "நிராகரி",
    
    // Reports
    reportsAnalytics: "அறிக்கைகள் & பகுப்பாய்வு",
    generateDownload: "கண்காணிப்பு அறிக்கைகளை உருவாக்கி பதிவிறக்கவும்",
    generateCustomReport: "தனிப்பயன் அறிக்கை உருவாக்கு",
    reportType: "அறிக்கை வகை",
    dateRange: "தேதி வரம்பு",
    format: "வடிவம்",
    generatedReports: "உருவாக்கப்பட்ட அறிக்கைகள்",
    noReportsYet: "இன்னும் அறிக்கைகள் எதுவும் இல்லை",
    generateFirstReport: "தொடங்க உங்கள் முதல் அறிக்கையை உருவாக்கவும்",
    
    // Messages
    alertWhenExceeds: "வாயு இந்த அளவை மீறும்போது எச்சரிக்கை",
    emergencyAlertThreshold: "அவசர எச்சரிக்கை எல்லை",
    adjustSensorSensitivity: "சென்சார் கண்டறிதல் உணர்திறனை சரிசெய்",
    automaticallyUpdate: "தானாக வாசிப்புகளை புதுப்பி",
    howOftenFetch: "புதிய தரவை எவ்வளவு அடிக்கடி பெறுவது",
    receiveAlertsEmail: "மின்னஞ்சல் வழியாக எச்சரிக்கைகளைப் பெறு",
    receiveCriticalSMS: "SMS வழியாக முக்கிய எச்சரிக்கைகளைப் பெறு",
    playSoundCritical: "முக்கிய நிகழ்வுகளில் ஒலி இயக்கு",
    useDarkTheme: "இருண்ட தீம் பயன்படுத்து",
    interfaceLanguage: "இடைமுக மொழி",
    
    // Days
    monday: "திங்",
    tuesday: "செவ்",
    wednesday: "புத",
    thursday: "வியா",
    friday: "வெள்",
    saturday: "சனி",
    sunday: "ஞாயி",
    
    // Report Types
    dailySummary: "தினசரி சுருக்கம்",
    weeklyAnalysis: "வாராந்திர பகுப்பாய்வு",
    monthlyReport: "மாதாந்திர அறிக்கை",
    customRange: "தனிப்பயன் வரம்பு",
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gasGuardLanguage') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('gasGuardLanguage', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};