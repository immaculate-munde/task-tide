
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Semester } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SemesterSetupForm } from '@/components/semesters/SemesterSetupForm'; 
import { useAppContext } from '@/hooks/useAppContext';
import { cn } from '@/lib/utils';
import { NotebookPen, PlusCircle, Lock, Globe } from 'lucide-react';

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { semesters: contextSemesters, role, currentUser } = useAppContext(); // Get semesters from context
  const [isCreateSemesterDialogOpen, setIsCreateSemesterDialogOpen] = useState(false);
  
  // Sort semesters: user-created first (if applicable), then by name
  const sortedSemesters = [...contextSemesters].sort((a, b) => {
    const aIsCreator = a.createdBy.id === currentUser.id;
    const bIsCreator = b.createdBy.id === currentUser.id;
    if (aIsCreator && !bIsCreator) return -1;
    if (!aIsCreator && bIsCreator) return 1;
    return a.name.localeCompare(b.name);
  });


  return (
    <div className="flex h-[calc(100vh-4rem)]"> {/* Adjust height based on your header */}
      <nav className="w-64 border-r bg-background flex flex-col"> {/* Increased width for icons */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-primary font-headline">Semesters</h2>
          {role === 'class_representative' && (
            <Dialog open={isCreateSemesterDialogOpen} onOpenChange={setIsCreateSemesterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Create new semester">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-headline text-primary">Create New Semester (Server)</DialogTitle>
                </DialogHeader>
                <SemesterSetupForm onSemesterCreated={() => setIsCreateSemesterDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sortedSemesters.map((semester) => {
              const isActive = pathname.startsWith(`/rooms/${semester.id}`);
              return (
                <Button
                  key={semester.id}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm items-center", // Ensure items are centered for icon alignment
                    isActive && "font-semibold text-primary"
                  )}
                  title={semester.name}
                >
                  <Link href={`/rooms/${semester.id}`} className="flex items-center w-full">
                    {semester.isPublic ? <Globe className="mr-2 h-4 w-4 flex-shrink-0" /> : <Lock className="mr-2 h-4 w-4 flex-shrink-0" />}
                    <span className="truncate flex-grow">{semester.name}</span>
                    {/* Optional: Add a small visual cue if the user created this semester */}
                    {semester.createdBy.id === currentUser.id && <NotebookPen className="ml-auto h-3 w-3 text-muted-foreground opacity-50" />}
                  </Link>
                </Button>
              );
            })}
             {sortedSemesters.length === 0 && (
                <p className="p-2 text-xs text-muted-foreground">No semesters (servers) found. Class Reps can create new ones.</p>
            )}
          </div>
        </ScrollArea>
      </nav>
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
