
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getUnitById, getSemesterById, getDocumentsByUnit, assignmentGroups as staticGroupsData } from "@/lib/data";
import type { DocumentFile, AssignmentGroup, Unit, Semester } from "@/lib/types";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { GroupCard } from "@/components/groups/GroupCard";
import { GroupSetupForm } from "@/components/groups/GroupSetupForm";
import { useAppContext } from "@/hooks/useAppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users as UsersIcon, FolderOpen, AlertCircle } from "lucide-react";
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
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-background">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">Unit or Semester Not Found</h1>
        <p className="text-lg text-muted-foreground mb-6">
          The specific unit or semester you are looking for could not be found. 
          It might have been moved, deleted, or the link might be incorrect.
        </p>
        <Button asChild variant="default" size="lg">
          <Link href="/rooms">
            <ArrowLeft className="mr-2 h-5 w-5" /> Go back to Rooms
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
    <div className="p-6 space-y-6"> {/* Added padding and space-y for consistency */}
      <header className="mb-2"> {/* Reduced mb from 8 to 2 */}
        {/* Removed Back to Rooms Button as per Discord-like navigation */}
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
            <FolderOpen className="mr-3 h-8 w-8" /> {unit.name}
        </h1>
        <p className="text-md text-muted-foreground mt-1">
          Resources and groups for {unit.name} in {semester.name}.
        </p>
      </header>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="documents"><BookOpen className="mr-2 h-5 w-5"/>Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="groups"><UsersIcon className="mr-2 h-5 w-5"/>Groups ({groups.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Unit Documents</CardTitle>
                    <CardDescription>All learning materials and resources for this unit.</CardDescription>
                </CardHeader>
                <CardContent>
                    {documents.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {documents.map((doc) => (
                            <DocumentCard key={doc.id} document={doc} />
                        ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground py-4 text-center">No documents found for this unit.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="groups">
            {role === 'class_representative' && (
                <div className="mb-6">
                <GroupSetupForm 
                    onGroupCreated={refreshGroups} 
                    initialSemesterId={params.semesterId}
                    initialUnitId={params.unitId}
                />
                </div>
            )}
             <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            type="search"
                            placeholder="Search groups in this unit by assignment name..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="available-unit-groups" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-2 mb-4"> {/* Ensure it's md:grid-cols-2 for proper wrapping */}
                    <TabsTrigger value="available-unit-groups">Available ({availableGroups.length})</TabsTrigger>
                    <TabsTrigger value="my-unit-groups">My Groups ({myGroups.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="available-unit-groups">
                    {availableGroups.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"> {/* Adjusted grid for potentially narrower space */}
                        {availableGroups.map((group) => (
                        <GroupCard key={group.id} group={group} onGroupJoinedOrUpdated={refreshGroups} />
                        ))}
                    </div>
                    ) : (
                    <Card>
                        <CardContent className="py-10 text-center">
                        <p className="text-lg text-muted-foreground">No available groups found in this unit{searchTerm && " matching your search"}.</p>
                        </CardContent>
                    </Card>
                    )}
                </TabsContent>
                <TabsContent value="my-unit-groups">
                {myGroups.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"> {/* Adjusted grid */}
                        {myGroups.map((group) => (
                        <GroupCard key={group.id} group={group} onGroupJoinedOrUpdated={refreshGroups} />
                        ))}
                    </div>
                    ) : (
                    <Card>
                        <CardContent className="py-10 text-center">
                        <p className="text-lg text-muted-foreground">You are not part of any groups for this unit, nor have you created any{searchTerm && " that match your search"}.</p>
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
