const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

interface User {
  id_user_account?: string; 
  id?: string; 
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  address?: string;
  created_at?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const userService = {
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la connexion');
      }

      const result = await response.json();

      const loginData = result.data || result;

      if (!loginData.token) {
        throw new Error('Aucun token reçu de l\'API');
      }

      // Sauvegarder
      localStorage.setItem('token', loginData.token);
      if (loginData.user) {
        localStorage.setItem('user', JSON.stringify(loginData.user));
      }

      console.log('✅ Connexion réussie');
      return loginData;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  },

  async register(userData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      const result = await response.json();

      const registerData = result.data || result;

      if (registerData.token) {
        localStorage.setItem('token', registerData.token);
        if (registerData.user) {
          localStorage.setItem('user', JSON.stringify(registerData.user));
        }
      }

      return registerData;
    } catch (error) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  },

  async getProfile(): Promise<User> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });


      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expirée');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération du profil');
      }

      const result = await response.json();
      let userData: User | null = null;

      if (result.data) {
        userData = result.data;
      }
      else if (result.user) {
        userData = result.user;
      }
      else if (result.id_user_account && result.email) {
        userData = result;
      }
      else if (result.id && result.email) {
        userData = result;
      }

      if (!userData) {
        console.error('❌ Structure non reconnue:', result);
        throw new Error('Format de réponse invalide');
      }

      if (userData.id_user_account && !userData.id) {
        userData.id = userData.id_user_account;
      }

      // Mise en cache
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ Profil récupéré et mis en cache:', userData);
      
      return userData;
    } catch (error) {
      console.error('❌ Erreur getProfile:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, userData: Partial<User>): Promise<User> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expirée');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }

      const result = await response.json();
      const updatedUser = result.data || result.user || result;

      // Normaliser l'id
      if (updatedUser.id_user_account && !updatedUser.id) {
        updatedUser.id = updatedUser.id_user_account;
      }

      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return updatedUser;
    } catch (error) {
      console.error('❌ Erreur updateProfile:', error);
      throw error;
    }
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      // Normaliser l'id si nécessaire
      if (user.id_user_account && !user.id) {
        user.id = user.id_user_account;
      }
      return user;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!(localStorage.getItem('token') && localStorage.getItem('user'));
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('isRedirecting');
    console.log('Déconnexion');
  },
};

export type { User, LoginResponse };
