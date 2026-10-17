import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, ROLE_LABELS } from '../config/navigation';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  roleLabel: string;
  userName: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('creatoros-role') as UserRole;
    if (saved && ROLE_LABELS[saved]) return saved;
    return 'creator';
  });

  const userName = 'Alex Morgan';

  useEffect(() => {
    localStorage.setItem('creatoros-role', role);
  }, [role]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        roleLabel: ROLE_LABELS[role] || 'Creator',
        userName,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
