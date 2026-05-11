import type { User, LoginCredentials, AuthState } from '@/types';
import { generateId } from '@/utils/id';

const ADMIN_EMAIL = 'admin@admin';
const ADMIN_PASSWORD = 'admin123456';

class AuthService {
  private users: User[] = [];
  private currentUser: AuthState | null = null;

  constructor() {
    this.loadFromStorage();
    this.initializeAdmin();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('tongzhou-users');
      if (stored) {
        this.users = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load users from storage:', error);
      this.users = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('tongzhou-users', JSON.stringify(this.users));
    } catch (error) {
      console.error('Failed to save users to storage:', error);
    }
  }

  private initializeAdmin() {
    const adminExists = this.users.find(u => u.email === ADMIN_EMAIL);
    
    if (!adminExists) {
      const admin: User = {
        id: generateId(),
        email: ADMIN_EMAIL,
        password: this.hashPassword(ADMIN_PASSWORD),
        username: '管理员',
        role: 'admin',
        createdAt: new Date(),
      };
      this.users.push(admin);
      this.saveToStorage();
      console.log('Admin account initialized:', ADMIN_EMAIL);
    }
  }

  private hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(16);
  }

  private verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  async login(credentials: LoginCredentials): Promise<AuthState> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.find(u => u.email === credentials.email);
        
        if (!user) {
          reject(new Error('用户不存在'));
          return;
        }

        if (!this.verifyPassword(credentials.password, user.password)) {
          reject(new Error('密码错误'));
          return;
        }

        user.lastLoginAt = new Date();
        this.saveToStorage();

        this.currentUser = {
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
          },
          token: 'token_' + generateId(),
        };

        this.saveAuthState();
        resolve(this.currentUser);
      }, 500);
    });
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('tongzhou-auth');
  }

  getAuthState(): AuthState | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const stored = localStorage.getItem('tongzhou-auth');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }

    return null;
  }

  private saveAuthState() {
    if (this.currentUser) {
      localStorage.setItem('tongzhou-auth', JSON.stringify(this.currentUser));
    }
  }

  async register(email: string, password: string, username: string): Promise<AuthState> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = this.users.find(u => u.email === email);
        
        if (existingUser) {
          reject(new Error('该邮箱已被注册'));
          return;
        }

        const newUser: User = {
          id: generateId(),
          email,
          password: this.hashPassword(password),
          username,
          role: 'user',
          createdAt: new Date(),
        };

        this.users.push(newUser);
        this.saveToStorage();

        this.currentUser = {
          isAuthenticated: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role,
            createdAt: newUser.createdAt,
          },
          token: 'token_' + generateId(),
        };

        this.saveAuthState();
        resolve(this.currentUser);
      }, 500);
    });
  }

  isAuthenticated(): boolean {
    return this.getAuthState()?.isAuthenticated || false;
  }

  isAdmin(): boolean {
    const state = this.getAuthState();
    return state?.user?.role === 'admin';
  }

  getCurrentUser(): AuthState['user'] {
    return this.getAuthState()?.user || null;
  }

  updateUser(userId: string, updates: Partial<Pick<User, 'username'>>) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      this.saveToStorage();
      
      if (this.currentUser?.user?.id === userId) {
        this.currentUser.user = { ...this.currentUser.user, ...updates };
        this.saveAuthState();
      }
    }
  }
}

export const authService = new AuthService();
