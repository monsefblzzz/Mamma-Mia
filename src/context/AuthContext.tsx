import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectZone, parseRawCustomers } from '../data/customerParser';

export type Role = 'CLIENTE' | 'CAMARERO' | 'COCINA' | 'REPARTIDOR' | 'ENCARGADO' | 'JEFE';

export interface User {
  id: string;
  name: string;
  phone: string;
  address?: string;
  zone?: string;
  role: Role;
  verified?: boolean;
  hasUsedWelcomeCoupon?: boolean;
  vapidKey?: string;
  savedAddresses?: string[];
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  setRole: (role: Role) => void;
  login: (phone: string, pin: string, name?: string, address?: string) => Promise<boolean>;
  logout: () => void;
  getUserByPhone: (phone: string) => User | undefined;
  createUser: (user: Partial<User>) => void;
  updateUser?: (id: string, user: Partial<User>) => void;
  deleteUser?: (id: string) => void;
  clearCustomers?: () => void;
  loadCustomers?: (newCustomers: User[]) => void;
  users: User[];
}

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin', phone: '000000000', role: 'JEFE' },
  { id: '2', name: 'Laura', phone: '600111222', role: 'CLIENTE', address: 'Calle Falsa 123' },
  { id: '3', name: 'Carlos', phone: '600333444', role: 'CAMARERO' },
  { id: '4', name: 'Marco', phone: '600555666', role: 'COCINA' },
  { id: '5', name: 'Alex', phone: '600777888', role: 'REPARTIDOR' },
  { id: '6', name: 'Sofía', phone: '600999000', role: 'ENCARGADO' },
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'CLIENTE',
  setRole: () => {},
  login: async () => false,
  logout: () => {},
  getUserByPhone: () => undefined,
  createUser: () => {},
  loadCustomers: () => {},
  users: [],
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Keep setRole for the simulator in the Layout
  const [simulatorRole, setSimulatorRole] = useState<Role | null>(null);

  useEffect(() => {
    // Load from DB instead of localStorage
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setUsers(data);
        } else {
          // If empty, seed initial users
          fetch('/api/users/batch', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({users: INITIAL_USERS})
          }).catch(console.error);
        }
        setIsInitialized(true);
      })
      .catch(err => {
        console.error('Failed to load users from DB', err);
        setIsInitialized(true);
      });
  }, []);

  // Optionally load some predefined clients if needed here
  useEffect(() => {
      if (!isInitialized) return;
      try {
          const batch = parseRawCustomers();
          if (batch.length > 0) {
              setUsers(prev => {
                  const existingPhones = new Set(prev.map((u: any) => u.phone));
                  const toAdd = batch.filter((b: any) => !existingPhones.has(b.phone));
                  
                  if (toAdd.length > 0) {
                    fetch('/api/users/batch', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({users: toAdd})
                    }).catch(console.error);
                  }
                  
                  return [...prev, ...toAdd];
              });
          }
      } catch (err) {}
  }, [isInitialized]);

  const role = simulatorRole || user?.role || 'CLIENTE';

  const setRole = (r: Role) => setSimulatorRole(r);

  const getUserByPhone = (phone: string) => users.find(u => u.phone === phone);

  const createUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(),
      name: userData.name || 'Usuario ' + userData.phone,
      phone: userData.phone || '',
      address: userData.address,
      role: userData.role || 'CLIENTE'
    };
    setUsers(prev => [...prev, newUser]);
    
    // Save to External Store
    fetch('/api/users', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(newUser)
    }).catch(console.error);

    return newUser;
  };

  const loadCustomers = (newCustomers: User[]) => {
      setUsers(prev => {
          const newMap = new Map(newCustomers.map(c => [c.phone, c]));
          const prevPhones = new Set(prev.map(u => u.phone));
          
          const updatedPrev = prev.map(u => {
              if (newMap.has(u.phone)) {
                  return { ...u, ...newMap.get(u.phone), id: u.id };
              }
              return u;
          });
          
          const toAdd = newCustomers.filter(c => !prevPhones.has(c.phone));
          
          const finalUsers = [...updatedPrev, ...toAdd];
          
          // Batch external update
          fetch('/api/users/batch', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({users: finalUsers})
          }).catch(console.error);

          return finalUsers;
      });
  };

  const updateUser = (id: string, userData: Partial<User>) => {
      setUsers(prev => {
        const next = prev.map(u => u.id === id ? { ...u, ...userData } : u);
        const updatedUser = next.find(u => u.id === id);
        if (updatedUser) {
          fetch('/api/users', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updatedUser)
          }).catch(console.error);
        }
        return next;
      });
      if (user?.id === id) {
          setUser(prev => prev ? { ...prev, ...userData } : null);
      }
  };

  const deleteUser = (id: string) => {
      setUsers(prev => prev.filter(u => u.id !== id));
  };

  const clearCustomers = () => {
      setUsers(prev => prev.filter(u => u.role !== 'CLIENTE'));
  };

  const login = async (phone: string, pin: string, name?: string, address?: string) => {
    // Mock login: any user with phone number and PIN "1234" logs in
    if (pin !== '1234') {
      alert('PIN incorrecto (Usa 1234 para probar)');
      return false;
    }

    let found = getUserByPhone(phone);
    if (!found) {
      if (name) {
         found = createUser({ phone, name, address, role: 'CLIENTE', verified: true });
      } else {
         found = createUser({ phone, address, role: 'CLIENTE', verified: true });
      }
    } else {
       if (address) found.address = address;
       found.verified = true;
       setUsers(prev => prev.map(u => u.id === found?.id ? found : u) as User[]);
       fetch('/api/users', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify(found)
       }).catch(console.error);
    }

    setUser(found);
    setSimulatorRole(null);
    return true;
  };

  const logout = () => {
    setUser(null);
    setSimulatorRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, login, logout, getUserByPhone, createUser, updateUser, deleteUser, clearCustomers, loadCustomers, users }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
