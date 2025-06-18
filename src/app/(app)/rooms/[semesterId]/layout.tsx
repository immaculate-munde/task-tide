
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUnitsBySemester, getSemesterById } from '@/lib/data';
import type { Unit, Semester } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LibrarySquare, AlertCircle } from 'lucide-react'; // Icon for units

export default function SemesterSpecificLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { semesterId: string };
}) {
  const pathname = usePathname();
  const semester: Semester | undefined = getSemesterById(params.semesterId);
  const units: Unit[] = semester ? getUnitsBySemester(params.semesterId) : [];

  if (!semester) {
    return (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h1 className="text-xl font-semibold text-destructive">Semester Not Found</h1>
            <p className="text-muted-foreground">The semester you are looking for does not exist or could not be loaded.</p>
            <Button asChild variant="link" className="mt-4">
                <Link href="/rooms">Go back to Rooms</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <nav className="w-64 border-r bg-muted/40 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-md font-semibold text-foreground font-headline truncate" title={semester.name}>
            Units in {semester.name}
          </h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {units.map((unit) => {
              const isActive = pathname === `/rooms/${params.semesterId}/${unit.id}`;
              return (
                <Button
                  key={unit.id}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm",
                     isActive && "font-semibold text-primary"
                  )}
                >
                  <Link href={`/rooms/${params.semesterId}/${unit.id}`}>
                    <LibrarySquare className="mr-2 h-4 w-4" />
                    {unit.name}
                  </Link>
                </Button>
              );
            })}
            {units.length === 0 && (
                <p className="p-2 text-xs text-muted-foreground">No units found in this semester.</p>
            )}
          </div>
        </ScrollArea>
      </nav>
      <main className="flex-1 p-0 overflow-y-auto"> {/* Changed p-6 to p-0 and added overflow-y-auto */}
        {children}
      </main>
    </div>
  );
}
