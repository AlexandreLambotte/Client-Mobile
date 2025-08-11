import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = process.env.API_BASE;

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  error: null,
};

/**
 * GET /user/{id}
 * Récupère le profil complet depuis l'API (utilise le token pour l'Authorization)
 */
export const fetchUserById = createAsyncThunk(
  'auth/fetchUserById',
  async ({ id, token: tokenArg }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = tokenArg || state.auth.token;

      const res = await fetch(`${API_BASE}/user/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        return rejectWithValue(txt || 'Erreur lors du chargement du profil');
      }

      const data = await res.json();
      return data; // objet user complet venant de la BD (inclut avatar, rank_id, etc.)
    } catch (err) {
      return rejectWithValue(err.message || 'Erreur réseau');
    }
  }
);

/**
 * PATCH /user/edit
 * Envoie un FormData (username/email/password/ avatar) puis recharge l'utilisateur via GET /user/{id}
 * -> renvoie l'objet user frais pour mettre à jour immédiatement le Redux.
 */
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ username, email, password, image }, { getState, rejectWithValue, dispatch }) => {
    try {
      const { token, user } = getState().auth;

      const formData = new FormData();
      formData.append('id', user.id);
      if (username) formData.append('username', username);
      if (email) formData.append('email', email);
      if (password) formData.append('password', password);
      if (image && image.uri) {
        formData.append('avatar', {
          uri: image.uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        });
      }

      const res = await fetch(`${API_BASE}/user/edit`, {
        method: 'PATCH',
        headers: {
          // ⚠️ ne pas définir 'Content-Type' ici, fetch le fait pour le FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        // Beaucoup d'APIs renvoient un body vide en erreur -> on lit en texte
        const txt = await res.text();
        return rejectWithValue(txt || 'Erreur serveur');
      }

      // ✅ Une fois l’update accepté, on recharge le user depuis l’API
      const refreshedUser = await dispatch(
        fetchUserById({ id: user.id, token })
      ).unwrap();

      return refreshedUser; // on renvoie l'objet user frais
    } catch (err) {
      return rejectWithValue(err.message || 'Erreur réseau');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // On stocke token + user (déjà complet idéalement)
    login: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserById
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.error = action.payload || 'Impossible de charger le profil';
      })
      // updateProfile -> renvoie déjà le user rafraîchi
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload || 'Erreur inconnue lors de la mise à jour';
      });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
