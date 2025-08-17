import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  userType: null,
  isAuthenticated: false,
  loading: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.userType = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
    }
  }
});

export const { setUser, setUserType, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
