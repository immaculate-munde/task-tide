
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSemesterById, getUnitsBySemester } from "@/lib/data";
import type { Unit, Semester } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, Info, LibraryBig, NotebookText, ChevronRight, Users, FolderOpen } from "lucide-react";
import Image from "next/image";

interface SemesterRoomPageProps {
  params: {
    semesterId: string;
  };
}

export default function SemesterRoomPage({ params }: SemesterRoomPageProps) {
  const semester = getSemesterById(params.semesterId);
  const units = semester ? getUnitsBySemester(params.semesterId) : [];

  if (!semester) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-destructive flex items-center justify-center">
              <Info className="mr-3 h-8 w-8" />
              Semester Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The semester (server) you are looking for does not exist.
            </p>
            <Button asChild variant="link" className="mt-4">
                <Link href="/rooms">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to All Semesters
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
              <NotebookText className="mr-3 h-8 w-8" />
              {semester.name}
            </h1>
            <p className="text-md text-muted-foreground mt-1">
              Created by: {semester.createdBy.name} | {semester.isPublic ? "Public Server" : "Private Server"}
            </p>
          </div>
        </div>
        <p className="text-lg text-muted-foreground mt-2">
          Browse units (channels) available in this semester. Select one to view its resources and groups.
        </p>
      </header>

      {units.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {units.map((unit) => (
            <Link href={`/rooms/${semester.id}/${unit.id}`} key={unit.id} className="block group">
              <Card className="h-full hover:shadow-xl hover:border-primary transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col">
                <CardHeader className="p-4">
                    <div className="aspect-[3/2] w-full relative overflow-hidden rounded-md mb-3">
                        <Image
                        src={`https://placehold.co/300x200.png?text=${encodeURIComponent(unit.name)}`}
                        alt={unit.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint="education abstract"
                        />
                    </div>
                  <CardTitle className="text-lg font-headline text-primary truncate" title={unit.name}>{unit.name}</CardTitle>
                   {unit.description && <CardDescription className="text-xs mt-1 h-8 overflow-hidden text-ellipsis">{unit.description}</CardDescription>}
                </CardHeader>
                <CardFooter className="p-4 mt-auto flex justify-end">
                  <Button variant="ghost" size="sm" aria-label={`View ${unit.name}`} className="text-xs text-primary group-hover:underline">
                    Open Unit <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
         <Card>
          <CardContent className="py-10 text-center">
            <p className="text-xl text-muted-foreground">No units (channels) found for {semester.name}.</p>
            <p className="mt-2">The class representative can add units to this semester (server).</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
