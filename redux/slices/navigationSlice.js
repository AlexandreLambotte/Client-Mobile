import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  start: null,          // { latitude, longitude }
  end: null,            // { latitude, longitude }
  landmarks: [],        // tableau des POI proposés par /landmark/best
  selectedPOIs: [],     // IDs sélectionnés (on en garde 0..1)
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setStart: (state, action) => {
      state.start = action.payload; // { latitude, longitude }
    },
    setEnd: (state, action) => {
      state.end = action.payload;   // { latitude, longitude }
    },
    setLandmarks: (state, action) => {
      // payload: [{ id, label, description, latitude, longitude, length_m, err_m }, ...]
      state.landmarks = Array.isArray(action.payload) ? action.payload : [];
      state.selectedPOIs = [];
    },
    togglePOI: (state, action) => {
      const id = action.payload;
      if (state.selectedPOIs.includes(id)) {
        state.selectedPOIs = state.selectedPOIs.filter(x => x !== id);
      } else {
        // autorise un seul POI à la fois
        state.selectedPOIs = [id];
      }
    },
    resetNavigation: (state) => {
      state.selectedPOIs = [];
      // state.start = null;
      // state.end = null;
      // state.landmarks = [];
    },
  },
});

export const {
  setStart,
  setEnd,
  setLandmarks,
  togglePOI,
  resetNavigation,
} = navigationSlice.actions;

export default navigationSlice.reducer;
