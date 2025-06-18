
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/hooks/useAppContext";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { getSemesters, getUnitsBySemester, getSemesterById, getUnitById } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect } from "react";


const groupFormSchema = z.object({
  assignmentName: z.string().min(3, { message: "Assignment name must be at least 3 characters." }),
  maxSize: z.coerce.number().min(1, { message: "Group size must be at least 1." }).max(10, { message: "Group size cannot exceed 10." }),
  semesterId: z.string().min(1, { message: "Please select a semester." }),
  unitId: z.string().min(1, { message: "Please select a unit." }),
});

type GroupFormValues = z.infer<typeof groupFormSchema>;

interface GroupSetupFormProps {
  onGroupCreated: () => void;
  initialSemesterId?: string;
  initialUnitId?: string;
}

export function GroupSetupForm({ onGroupCreated, initialSemesterId, initialUnitId }: GroupSetupFormProps) {
  const { createGroup, currentUser } = useAppContext();
  const { toast } = useToast();
  
  const [selectedSemester, setSelectedSemester] = React.useState<string>(initialSemesterId || "");

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      assignmentName: "",
      maxSize: 3,
      semesterId: initialSemesterId || "",
      unitId: initialUnitId || "",
    },
  });

  const semesters = getSemesters();
  const unitsForSelectedSemester = selectedSemester ? getUnitsBySemester(selectedSemester) : [];

  useEffect(() => {
    if (initialSemesterId) {
      form.setValue("semesterId", initialSemesterId);
      setSelectedSemester(initialSemesterId);
    }
    if (initialUnitId) {
      form.setValue("unitId", initialUnitId);
    }
  }, [initialSemesterId, initialUnitId, form]);


  function onSubmit(data: GroupFormValues) {
    if (currentUser.role !== 'class_representative') {
      toast({ title: "Permission Denied", description: "Only class representatives can create groups.", variant: "destructive" });
      return;
    }
    
    const newGroup = createGroup({
      assignmentName: data.assignmentName,
      maxSize: data.maxSize,
      semesterId: data.semesterId, // This will be the pre-filled/disabled value if initialSemesterId was passed
      unitId: data.unitId, // This will be the pre-filled/disabled value if initialUnitId was passed
    });

    if (newGroup) {
      toast({
        title: "Group Created!",
        description: `Group "${data.assignmentName}" has been successfully created for ${getUnitById(newGroup.unitId || "")?.name || 'the selected unit'}.`,
      });
      form.reset({ // Reset with initial values if provided, otherwise to blank
        assignmentName: "",
        maxSize: 3,
        semesterId: initialSemesterId || "",
        unitId: initialUnitId || "",
      });
      if (!initialSemesterId) setSelectedSemester(""); // Only reset selectedSemester if it wasn't an initial prop
      onGroupCreated(); 
    } else {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    }
  }
  
  const currentSemester = initialSemesterId ? getSemesterById(initialSemesterId) : null;
  const currentUnit = initialUnitId ? getUnitById(initialUnitId) : null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center text-primary">
            <PlusCircle className="mr-2 h-6 w-6"/>
            Create New Assignment Group
        </CardTitle>
        {currentUnit && currentSemester ? (
             <CardDescription>
                Define the details for a new assignment group for <strong>{currentUnit.name} ({currentSemester.name})</strong>. Students will be able to join this group.
            </CardDescription>
        ): (
            <CardDescription>Define the details for a new assignment group. Students will be able to join this group.</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="assignmentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Midterm Project Submission" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Group Size</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="semesterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedSemester(value);
                      form.setValue("unitId", ""); 
                    }} 
                    value={field.value} // Use value from form state
                    disabled={!!initialSemesterId} // Disable if initialSemesterId is provided
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a semester" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {initialSemesterId && currentSemester ? (
                        <SelectItem value={initialSemesterId}>{currentSemester.name}</SelectItem>
                      ) : (
                        semesters.map(semester => (
                          <SelectItem key={semester.id} value={semester.id}>{semester.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value} // Use value from form state
                    disabled={!selectedSemester || !!initialUnitId} // Disable if no semester selected or if initialUnitId provided
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {initialUnitId && currentUnit ? (
                        <SelectItem value={initialUnitId}>{currentUnit.name}</SelectItem>
                      ) : (
                        unitsForSelectedSemester.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                        ))
                       )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-5 w-5"/> Create Group
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
