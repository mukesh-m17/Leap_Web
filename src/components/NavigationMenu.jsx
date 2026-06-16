import React, { useEffect, useState } from "react";

const DEFAULT_USER = {
  name: "Mukesh",
  email: "mukeshm50087@gmail.com",
  phone: "+91 7810021740",
  role: "Safety Operator",
};

const LOGIN_PASSWORD = "Mukesh@06";

export default function NavigationMenu({ currentPage, onPageChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("gasGuardUser");
    return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLogin = localStorage.getItem("gasGuardLoggedIn");
    return savedLogin ? savedLogin === "true" : true;
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [profileForm, setProfileForm] = useState(user);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    localStorage.setItem("gasGuardUser", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("gasGuardLoggedIn", isLoggedIn ? "true" : "false");

    if (!isLoggedIn) {
      setShowLoginModal(true);
    }
  }, [isLoggedIn]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "history", label: "History", icon: "📜" },
    { id: "settings", label: "Settings", icon: "⚙️" },
    { id: "alerts", label: "Alerts", icon: "🔔" },
    { id: "reports", label: "Reports", icon: "📄" },
  ];

  const handleNavigation = (pageId) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    onPageChange(pageId);
    setIsOpen(false);
  };

  const openProfile = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    setProfileForm(user);
    setShowProfileModal(true);
    setIsOpen(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (!profileForm.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!profileForm.email.trim()) {
      alert("Please enter your email.");
      return;
    }

    setUser(profileForm);
    setShowProfileModal(false);
    alert("Profile updated successfully!");
  };

  const handleLogoutClick = () => {
    if (!isLoggedIn) return;
    setShowLogoutConfirm(true);
    setIsOpen(false);
  };

  const confirmLogout = () => {
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
    setShowLoginModal(true);
    onPageChange("dashboard");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const enteredEmail = loginForm.email.trim().toLowerCase();
    const defaultEmail = DEFAULT_USER.email.trim().toLowerCase();
    const savedEmail = user.email.trim().toLowerCase();

    if (!enteredEmail) {
      alert("Please enter your email.");
      return;
    }

    if (!loginForm.password.trim()) {
      alert("Please enter your password.");
      return;
    }

    if (enteredEmail !== defaultEmail && enteredEmail !== savedEmail) {
      alert("Invalid email address.");
      return;
    }

    if (loginForm.password !== LOGIN_PASSWORD) {
      alert("Invalid password.");
      return;
    }

    const updatedUser = {
      ...user,
      email: loginForm.email,
    };

    setUser(updatedUser);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setLoginForm({
      email: "",
      password: "",
    });

    alert("Login successful!");
  };

  const handleDemoLogin = () => {
    const demoUser = {
      name: "Demo Operator",
      email: "demo@gasguard.com",
      phone: "+91 90000 00000",
      role: "Demo Safety Operator",
    };

    setUser(demoUser);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setLoginForm({
      email: "",
      password: "",
    });

    alert("Logged in as demo user!");
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="main-nav">
        <div className="nav-container">
          <div
            className="nav-brand"
            onClick={() => handleNavigation("dashboard")}
          >
            <div className="brand-icon">⚡</div>
            <div className="brand-text">
              <span className="brand-name">GasGuard</span>
              <span className="brand-subtitle">Pro</span>
            </div>
          </div>

          <div className="nav-menu">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${
                  currentPage === item.id ? "active" : ""
                }`}
                onClick={() => handleNavigation(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {currentPage === item.id && <div className="nav-indicator" />}
              </button>
            ))}
          </div>

          <div className="nav-actions">
            <button
              className="nav-action-btn"
              title="Notifications"
              onClick={() => handleNavigation("alerts")}
            >
              <span className="action-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>

            <button
              className="profile-chip"
              title="Profile"
              onClick={openProfile}
            >
              <span className="profile-avatar">{getInitials(user.name)}</span>
              <span className="profile-chip-info">
                <span className="profile-chip-name">
                  {isLoggedIn ? user.name : "Guest"}
                </span>
                <span className="profile-chip-role">
                  {isLoggedIn ? user.role : "Logged out"}
                </span>
              </span>
            </button>

            <button
              className="nav-action-btn logout-nav-btn"
              title="Logout"
              onClick={handleLogoutClick}
              disabled={!isLoggedIn}
            >
              <span className="action-icon">🚪</span>
            </button>
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`hamburger ${isOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu-overlay ${isOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <div className="mobile-brand">
              <div className="brand-icon">⚡</div>
              <span>GasGuard Pro</span>
            </div>
            <button
              className="mobile-menu-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="mobile-profile-card">
            <div className="mobile-profile-avatar">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="mobile-profile-name">
                {isLoggedIn ? user.name : "Guest User"}
              </p>
              <p className="mobile-profile-email">
                {isLoggedIn ? user.email : "Not logged in"}
              </p>
            </div>
          </div>

          <div className="mobile-menu-items">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`mobile-menu-item ${
                  currentPage === item.id ? "active" : ""
                }`}
                onClick={() => handleNavigation(item.id)}
              >
                <span className="mobile-item-icon">{item.icon}</span>
                <span className="mobile-item-label">{item.label}</span>
                {currentPage === item.id && (
                  <span className="mobile-item-check">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="mobile-menu-footer">
            <button className="mobile-footer-btn" onClick={openProfile}>
              <span>👤</span> Profile
            </button>

            {isLoggedIn ? (
              <button
                className="mobile-footer-btn logout"
                onClick={handleLogoutClick}
              >
                <span>🚪</span> Logout
              </button>
            ) : (
              <button
                className="mobile-footer-btn"
                onClick={() => {
                  setShowLoginModal(true);
                  setIsOpen(false);
                }}
              >
                <span>🔐</span> Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="account-modal-overlay">
          <div className="account-modal profile-modal">
            <button
              className="account-modal-close"
              onClick={() => setShowProfileModal(false)}
            >
              ✕
            </button>

            <div className="account-modal-header">
              <div className="account-big-avatar">
                {getInitials(profileForm.name)}
              </div>
              <div>
                <h2>Profile Settings</h2>
                <p>Update your account information</p>
              </div>
            </div>

            <form className="account-form" onSubmit={handleSaveProfile}>
              <div className="account-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  placeholder="Enter your name"
                />
              </div>

              <div className="account-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  placeholder="Enter your email"
                />
              </div>

              <div className="account-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="account-form-group">
                <label>Role</label>
                <select
                  value={profileForm.role}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, role: e.target.value })
                  }
                >
                  <option value="Safety Operator">Safety Operator</option>
                  <option value="Admin">Admin</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>

              <div className="account-modal-actions">
                <button
                  type="button"
                  className="account-secondary-btn"
                  onClick={() => setShowProfileModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="account-primary-btn">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="account-modal-overlay">
          <div className="account-modal logout-modal">
            <div className="logout-icon">🚪</div>
            <h2>Logout?</h2>
            <p>Are you sure you want to logout from GasGuard Pro?</p>

            <div className="account-modal-actions">
              <button className="account-secondary-btn" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="account-danger-btn" onClick={confirmLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="account-modal-overlay force-login">
          <div className="account-modal login-modal">
            <div className="login-logo">⚡</div>
            <h2>Welcome Back</h2>
            <p>Login to continue monitoring your gas safety system.</p>

            <form className="account-form" onSubmit={handleLogin}>
              <div className="account-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  placeholder="example@gmail.com"
                />
              </div>

              <div className="account-form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  placeholder="Enter password"
                />
              </div>

              <button type="submit" className="account-primary-btn full">
                Login
              </button>

              <button
                type="button"
                className="account-secondary-btn full"
                onClick={handleDemoLogin}
              >
                Continue as Demo User
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}