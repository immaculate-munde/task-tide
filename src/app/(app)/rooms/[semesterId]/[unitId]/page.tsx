
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getUnitById, getSemesterById, getDocumentsByUnit, getGroups as getAllGroups, assignmentGroups as staticGroupsData } from "@/lib/data";
import type { DocumentFile, AssignmentGroup, Unit, Semester } from "@/lib/types";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { GroupCard } from "@/components/groups/GroupCard";
import { GroupSetupForm } from "@/components/groups/GroupSetupForm";
import { useAppContext } from "@/hooks/useAppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users as UsersIcon, FolderOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UnitRoomPageProps {
  params: {
    semesterId: string;
    unitId: string;
  };
}

export default function UnitRoomPage({ params }: UnitRoomPageProps) {
  const { currentUser, role } = useAppContext();
  const [unit, setUnit] = useState<Unit | null | undefined>(null);
  const [semester, setSemester] = useState<Semester | null | undefined>(null);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [groups, setGroups] = useState<AssignmentGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const refreshGroups = useCallback(() => {
    const allGroups = getAllGroups(); // In a real app, this would be an API call.
    const unitGroups = allGroups.filter(g => g.unitId === params.unitId && g.semesterId === params.semesterId);
    // To ensure updates from addGroup/joinGroup in data.ts are reflected if it modifies the array in place:
    setGroups([...staticGroupsData].filter(g => g.unitId === params.unitId && g.semesterId === params.semesterId));
  }, [params.unitId, params.semesterId]);
  
  useEffect(() => {
    setIsLoading(true);
    const foundSemester = getSemesterById(params.semesterId);
    const foundUnit = getUnitById(params.unitId);
    
    setSemester(foundSemester);
    setUnit(foundUnit);

    if (foundUnit && foundSemester) {
      const unitDocuments = getDocumentsByUnit(foundSemester.id, foundUnit.id);
      setDocuments(unitDocuments);
      refreshGroups();
    }
    setIsLoading(false);
  }, [params.semesterId, params.unitId, refreshGroups]);

  if (isLoading) {
    return <div className="container mx-auto py-10 text-center">Loading unit details...</div>;
  }

  if (!unit || !semester) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold text-destructive">Unit or Semester Not Found</h1>
        <p className="text-muted-foreground mt-2">The requested unit or semester does not exist.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/rooms">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Rooms
          </Link>
        </Button>
      </div>
    );
  }

  const filteredGroups = groups.filter(group => 
    group.assignmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const myGroups = filteredGroups.filter(g => g.members.some(m => m.id === currentUser.id) || g.createdBy.id === currentUser.id);
  const availableGroups = filteredGroups.filter(g => !g.members.some(m => m.id === currentUser.id) && g.createdBy.id !== currentUser.id && g.members.length < g.maxSize);


  return (
    <div className="container mx-auto py-2">
      <header className="mb-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/rooms">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rooms
            </Link>
        </Button>
        <h1 className="text-4xl font-bold font-headline text-primary flex items-center">
            <FolderOpen className="mr-3 h-10 w-10" /> {unit.name}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Resources and groups for {unit.name} in {semester.name}.
        </p>
      </header>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="documents"><BookOpen className="mr-2 h-5 w-5"/>Documents</TabsTrigger>
          <TabsTrigger value="groups"><UsersIcon className="mr-2 h-5 w-5"/>Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Unit Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    {documents.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {documents.map((doc) => (
                            <DocumentCard key={doc.id} document={doc} />
                        ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No documents found for this unit.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="groups">
            {role === 'class_representative' && (
                <div className="mb-8">
                <GroupSetupForm onGroupCreated={refreshGroups} />
                </div>
            )}
             <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            type="search"
                            placeholder="Search groups in this unit..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="available-unit-groups" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-1/2 mb-4">
                    <TabsTrigger value="available-unit-groups">Available to Join</TabsTrigger>
                    <TabsTrigger value="my-unit-groups">My Groups / Created</TabsTrigger>
                </TabsList>
                <TabsContent value="available-unit-groups">
                    {availableGroups.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {availableGroups.map((group) => (
                        <GroupCard key={group.id} group={group} onGroupJoinedOrUpdated={refreshGroups} />
                        ))}
                    </div>
                    ) : (
                    <Card>
                        <CardContent className="py-10 text-center">
                        <p className="text-xl text-muted-foreground">No available groups found in this unit.</p>
                        </CardContent>
                    </Card>
                    )}
                </TabsContent>
                <TabsContent value="my-unit-groups">
                {myGroups.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {myGroups.map((group) => (
                        <GroupCard key={group.id} group={group} onGroupJoinedOrUpdated={refreshGroups} />
                        ))}
                    </div>
                    ) : (
                    <Card>
                        <CardContent className="py-10 text-center">
                        <p className="text-xl text-muted-foreground">You are not part of any groups for this unit, nor have you created any.</p>
                        </CardContent>
                    </Card>
                    )}
                </TabsContent>
            </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// For Next.js to know which paths to pre-render if these are fully static.
// If your units/semesters change often, you might adjust this or use dynamic rendering.
// For now, assuming they are relatively static.
export async function generateStaticParams() {
  const semesters = getSemesters(); // ensure this is available/imported if not in global scope
  const paths = [];
  for (const semester of semesters) {
    const units = getUnitsBySemester(semester.id);
    for (const unit of units) {
      paths.push({ semesterId: semester.id, unitId: unit.id });
    }
  }
  return paths;
}

