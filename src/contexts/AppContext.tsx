
"use client";

import type { User, UserRole, Semester } from '@/lib/types';
import { mockUserStudent, mockUserClassRep, addNotification, addGroup as addGroupData, joinGroup as joinGroupData, addSemester as addSemesterData, semesters as staticSemesters } from '@/lib/data';
import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { AssignmentGroup } from '@/lib/types';

interface AppContextType {
  currentUser: User;
  role: UserRole;
  setRole: (role: UserRole) => void;
  createNotification: (title: string, description: string, link?: string) => void;
  createGroup: (groupDetails: Omit<AssignmentGroup, 'id' | 'members' | 'createdBy'>) => AssignmentGroup | null;
  joinGroup: (groupId: string) => boolean;
  semesters: Semester[]; // Add semesters to context
  createSemester: (name: string, isPublic: boolean) => Semester | null; // Add createSemester
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUserStudent);
  const [semesters, setSemesters] = useState<Semester[]>(staticSemesters); // Manage semesters in state

  const setRole = useCallback((newRole: UserRole) => {
    setCurrentUser(prevUser => {
      if (newRole === 'student') return mockUserStudent;
      if (newRole === 'class_representative') return mockUserClassRep;
      return prevUser; // Should not happen
    });
  }, []);
  
  // Function to refresh semesters from data source if needed, e.g., after creation
  const refreshSemesters = useCallback(() => {
    setSemesters([...staticSemesters]); // Re-fetch or update from the mutable source
  }, []);

  useEffect(() => {
    refreshSemesters(); // Initial load
  }, [refreshSemesters]);


  const createNotification = (title: string, description: string, link?: string) => {
    addNotification(title, description, link);
    // In a real app, you might want to trigger a re-fetch or update a local state of notifications
  };
  
  const createGroup = (groupDetails: Omit<AssignmentGroup, 'id' | 'members' | 'createdBy'>): AssignmentGroup | null => {
    if (currentUser.role !== 'class_representative') {
      console.error("Only class representatives can create groups.");
      return null;
    }
    const newGroup = addGroupData(groupDetails, currentUser);
    createNotification("New Group Created", `Group "${newGroup.assignmentName}" is now available.`, `/rooms/${newGroup.semesterId}/${newGroup.unitId}`);
    return newGroup;
  };

  const joinGroup = (groupId: string): boolean => {
    if (currentUser.role !== 'student') {
      console.error("Only students can join groups.");
      return false;
    }
    const group = staticSemesters.flatMap(s => addGroupData.assignmentGroups.find(g => g.id === groupId)); // This needs to access actual groups
    const success = joinGroupData(groupId, currentUser); // joinGroupData modifies the source array
    if (success) {
      const joinedGroup = addGroupData.assignmentGroups.find(g => g.id === groupId);
      createNotification("Joined Group", `You have successfully joined the group: ${joinedGroup?.assignmentName}.`, `/rooms/${joinedGroup?.semesterId}/${joinedGroup?.unitId}`);
    }
    return success;
  };

  const createSemester = (name: string, isPublic: boolean): Semester | null => {
    if (currentUser.role !== 'class_representative') {
      console.error("Only class representatives can create semesters (servers).");
      return null;
    }
    const newSemester = addSemesterData(name, isPublic, currentUser); // addSemesterData modifies the source array
    createNotification("New Semester Created", `The semester (server) "${newSemester.name}" is now available.`, `/rooms/${newSemester.id}`);
    refreshSemesters(); // Refresh the semesters list in context
    return newSemester;
  };


  return (
    <AppContext.Provider value={{ 
        currentUser, 
        role: currentUser.role, 
        setRole, 
        createNotification, 
        createGroup, 
        joinGroup,
        semesters, // Provide semesters
        createSemester // Provide createSemester
    }}>
      {children}
    </AppContext.Provider>
  );
};
