import type { User, LoginCredentials, AuthState } from '@/types';
import { generateId } from '@/utils/id';

const ADMIN_EMAIL = 'admin@admin';
const ADMIN_PASSWORD = 'admin123456';
const ADMIN_USERNAME = '管理员';

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
        const parsed = JSON.parse(stored);
        this.users = parsed.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : undefined,
        }));
      }
      const authStored = localStorage.getItem('tongzhou-auth');
      if (authStored) {
        this.currentUser = JSON.parse(authStored);
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('tongzhou-users', JSON.stringify(this.users));
      if (this.currentUser) {
        localStorage.setItem('tongzhou-auth', JSON.stringify(this.currentUser));
      }
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }

  private initializeAdmin() {
    const adminExists = this.users.find(u => u.email === ADMIN_EMAIL);
    
    if (!adminExists) {
      const admin: User = {
        id: generateId(),
        email: ADMIN_EMAIL,
        username: ADMIN_USERNAME,
        role: 'admin',
        createdAt: new Date(),
      };
      this.users.push(admin);
      console.log('✅ 管理员账户已创建: admin@admin / admin123456');
    } else {
      console.log('✅ 管理员账户已存在');
    }
    this.saveToStorage();
  }

  async login(credentials: LoginCredentials): Promise<AuthState> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.find(u => u.email === credentials.email);
        
        if (!user) {
          reject(new Error('用户不存在'));
          return;
        }

        const storedPassword = localStorage.getItem(`tongzhou-password-${user.id}`);
        const passwordHash = this.hashPassword(credentials.password);
        
        if (storedPassword && storedPassword !== passwordHash) {
          reject(new Error('密码错误'));
          return;
        }

        if (user.role === 'user' && !storedPassword) {
          localStorage.setItem(`tongzhou-password-${user.id}`, passwordHash);
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
            avatar: user.avatar,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
          },
          token: 'token_' + generateId(),
        };

        this.saveToStorage();
        console.log(`✅ ${user.username} 登录成功`);
        resolve(this.currentUser);
      }, 300);
    });
  }

  logout() {
    if (this.currentUser) {
      console.log(`👋 ${this.currentUser.user?.username} 已退出`);
    }
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
          username,
          role: 'user',
          createdAt: new Date(),
        };

        this.users.push(newUser);
        localStorage.setItem(`tongzhou-password-${newUser.id}`, this.hashPassword(password));
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

        this.saveToStorage();
        console.log(`✅ ${username} 注册成功`);
        resolve(this.currentUser);
      }, 300);
    });
  }

  isAuthenticated(): boolean {
    return this.getAuthState()?.isAuthenticated || false;
  }

  isAdmin(): boolean {
    const state = this.getAuthState();
    return state?.user?.role === 'admin';
  }

  getCurrentUser(): User | null {
    return this.getAuthState()?.user || null;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  updateUserRole(userId: string, role: 'user' | 'admin') {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.role = role;
      this.saveToStorage();
    }
  }

  private hashPassword(password: string): string {
    let hash = 5381;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) + hash) + password.charCodeAt(i);
      hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(16);
  }
}

export const authService = new AuthService();
