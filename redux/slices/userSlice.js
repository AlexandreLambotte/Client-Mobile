import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  username: null,
  email: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      const { id, username, email, token } = action.payload;
      state.id = id;
      state.username = username;
      state.email = email;
      state.token = token;
    },
    clearUser(state) {
      Object.assign(state, initialState);
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
