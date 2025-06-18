
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSemesters } from '@/lib/data';
import type { Semester } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotebookPen } from 'lucide-react'; // Using a different icon for semesters

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const semesters: Semester[] = getSemesters();

  return (
    <div className="flex h-[calc(100vh-4rem)]"> {/* Adjust height based on your header */}
      <nav className="w-56 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-primary font-headline">Semesters</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {semesters.map((semester) => {
              const isActive = pathname.startsWith(`/rooms/${semester.id}`);
              return (
                <Button
                  key={semester.id}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm",
                    isActive && "font-semibold text-primary"
                  )}
                >
                  <Link href={`/rooms/${semester.id}`}>
                    <NotebookPen className="mr-2 h-4 w-4" />
                    {semester.name}
                  </Link>
                </Button>
              );
            })}
             {semesters.length === 0 && (
                <p className="p-2 text-xs text-muted-foreground">No semesters found.</p>
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
