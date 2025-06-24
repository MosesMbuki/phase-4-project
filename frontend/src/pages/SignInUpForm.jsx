import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import styles from '../SignInUpForm.module.css';

const SignInUpForm = () => {
  const { 
    register_user, 
    login_user, 
    isLoading 
  } = useContext(UserContext);
  
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (isSignUp) => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignUp) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    
    const { success, error } = await register_user(
      formData.name, 
      formData.email, 
      formData.password
    );
    
    if (success) {
      setFormData({
        name: '',
        email: '',
        password: ''
      });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    
    await login_user(formData.email, formData.password);
  };

  return (
    <div className={styles['signin-page-container']}>
      <div className={`${styles['signin-form-container']} ${isRightPanelActive ? styles['right-panel-active'] : ''}`}>
        {/* Sign Up Form */}
        <div className={`${styles['form-panel']} ${styles['sign-up-panel']}`}>
          <form onSubmit={handleSignUp}>
            <h1>Create Account</h1>        
            <input 
              type="text" 
              name="name" 
              placeholder="Name" 
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? styles.error : ''}
            />
            {errors.name && <span className={styles['error-message']}>{errors.name}</span>}
            
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? styles.error : ''}
            />
            {errors.email && <span className={styles['error-message']}>{errors.email}</span>}
            
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? styles.error : ''}
            />
            {errors.password && <span className={styles['error-message']}>{errors.password}</span>}
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={`${styles['form-panel']} ${styles['sign-in-panel']}`}>
          <form onSubmit={handleSignIn}>
            <h1>Sign in</h1>            
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? styles.error : ''}
            />
            {errors.email && <span className={styles['error-message']}>{errors.email}</span>}
            
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? styles.error : ''}
            />
            {errors.password && <span className={styles['error-message']}>{errors.password}</span>}
            
            <a href="#">Forgot your password?</a>
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Overlay */}
        <div className={styles['overlay-container']}>
          <div className={styles.overlay}>
            <div className={`${styles['overlay-panel']} ${styles['overlay-left']}`}>
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button 
                className={styles.ghost} 
                onClick={() => setIsRightPanelActive(false)}
                disabled={isLoading}
              >
                Sign In
              </button>
            </div>
            <div className={`${styles['overlay-panel']} ${styles['overlay-right']}`}>
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button 
                className={styles.ghost} 
                onClick={() => setIsRightPanelActive(true)}
                disabled={isLoading}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInUpForm;