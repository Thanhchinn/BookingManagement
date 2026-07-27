import { create } from 'zustand';
import apiClient from '../services/apiClient';

interface AuthState {
  userName: string | null;
  partnerName: string | null;
  isAdminLoggedIn: boolean;
  userToken: string | null;
  adminToken: string | null;
  userInfo: any | null;
  adminProfile: any | null;
  
  loginUser: (name: string, token: string, userInfo: any) => void;
  logoutUser: () => void;
  setUserName: (name: string) => void;
  
  loginAdmin: (token: string, profile: any) => void;
  logoutAdmin: () => void;
  
  loginPartner: (name: string) => void;
  logoutPartner: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Khôi phục token và user từ localStorage
  const getInitialToken = () => localStorage.getItem('user_token');
  const getInitialUserInfo = () => {
    const saved = localStorage.getItem('user_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  };
  const getInitialUser = () => {
    const info = getInitialUserInfo();
    return info ? info.fullName || null : null;
  };

  // Khôi phục admin từ localStorage
  const getInitialAdminToken = () => localStorage.getItem('admin_token');
  const getInitialAdminProfile = () => {
    const saved = localStorage.getItem('admin_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  };

  return {
    userName: getInitialUser(),
    partnerName: localStorage.getItem('partner_name') || null,
    isAdminLoggedIn: !!getInitialAdminToken(),
    userToken: getInitialToken(),
    adminToken: getInitialAdminToken(),
    userInfo: getInitialUserInfo(),
    adminProfile: getInitialAdminProfile(),

    loginUser: (name, token, userInfo) => {
      localStorage.setItem('user_token', token);
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      set({ userName: name, userToken: token, userInfo: userInfo });
    },

    logoutUser: () => {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('partner_name');
      apiClient.post('/auth/logout').catch(() => {});
      set({ userName: null, partnerName: null, userToken: null, userInfo: null });
    },

    setUserName: (name) => {
      set({ userName: name });
    },

    loginAdmin: (token, profile) => {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_profile', JSON.stringify(profile));
      set({ isAdminLoggedIn: true, adminToken: token, adminProfile: profile });
    },

    logoutAdmin: () => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_profile');
      apiClient.post('/auth/logout').catch(() => {});
      set({ isAdminLoggedIn: false, adminToken: null, adminProfile: null });
    },

    loginPartner: (name) => {
      localStorage.setItem('partner_name', name);
      set({ partnerName: name });
    },

    logoutPartner: () => {
      localStorage.removeItem('partner_name');
      set({ partnerName: null });
    },
  };
});
