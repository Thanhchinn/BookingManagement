import { create } from 'zustand';

interface AuthState {
  userName: string | null;
  partnerName: string | null;
  isAdminLoggedIn: boolean;
  
  loginUser: (name: string, token: string, userInfo: any) => void;
  logoutUser: () => void;
  setUserName: (name: string) => void;
  
  loginAdmin: (token: string, profile: any) => void;
  logoutAdmin: () => void;
  
  loginPartner: (name: string) => void;
  logoutPartner: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Khôi phục user từ localStorage
  const getInitialUser = () => {
    const saved = localStorage.getItem('user_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.fullName || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  // Khôi phục admin từ localStorage
  const getInitialAdmin = () => {
    const token = localStorage.getItem('admin_token');
    const profile = localStorage.getItem('admin_profile');
    return !!(token && profile);
  };

  return {
    userName: getInitialUser(),
    partnerName: localStorage.getItem('partner_name') || null,
    isAdminLoggedIn: getInitialAdmin(),

    loginUser: (name, token, userInfo) => {
      localStorage.setItem('user_token', token);
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      set({ userName: name });
    },

    logoutUser: () => {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('partner_name');
      set({ userName: null, partnerName: null });
    },

    setUserName: (name) => {
      set({ userName: name });
    },

    loginAdmin: (token, profile) => {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_profile', JSON.stringify(profile));
      set({ isAdminLoggedIn: true });
    },

    logoutAdmin: () => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_profile');
      set({ isAdminLoggedIn: false });
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
