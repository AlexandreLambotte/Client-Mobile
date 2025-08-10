import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ✅ Thunk pour récupérer les landmarks depuis l'API
export const fetchLandmarksThunk = createAsyncThunk(
  'navigation/fetchLandmarksThunk',
  async (token, { rejectWithValue }) => {
    try {
      const res = await fetch('http://192.168.0.44:3001/landmark/all?limit=15&skip=0', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const data = await res.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Erreur inconnue');
    }
  }
);

const navigationSlice = createSlice({
  name: 'navigation',
  initialState: {
    landmarks: [],
    selectedPOIs: [],
    loading: false,
    error: null,
  },
  reducers: {
    togglePOI: (state, action) => {
      const id = action.payload;
      state.selectedPOIs = state.selectedPOIs.includes(id)
        ? state.selectedPOIs.filter(p => p !== id)
        : [...state.selectedPOIs, id];
    },
    resetNavigation: (state) => {
      state.selectedPOIs = [];
    },
    setLandmarks: (state, action) => {
      state.landmarks = action.payload;
    },
    clearLandmarks: (state) => {
      state.landmarks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLandmarksThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLandmarksThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.landmarks = action.payload;
      })
      .addCase(fetchLandmarksThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  togglePOI,
  resetNavigation,
  setLandmarks,
  clearLandmarks
} = navigationSlice.actions;

export default navigationSlice.reducer;