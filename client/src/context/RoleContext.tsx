import React, { createContext, useContext } from 'react';
import { UserRole, ROLE_LABELS } from '../config/navigation';
import { useAuth } from './AuthContext';

interface RoleContextType {
  role: UserRole;
  roleLabel: string;
  userName: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const role: UserRole = user?.role || 'creator';
  const roleLabel = ROLE_LABELS[role] || 'Creator';
  const userName = user?.name || 'Guest';

  return (
    <RoleContext.Provider
      value={{
        role,
        roleLabel,
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
