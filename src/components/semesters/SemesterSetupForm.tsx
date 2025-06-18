
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
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/hooks/useAppContext";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

const semesterFormSchema = z.object({
  name: z.string().min(3, { message: "Semester name must be at least 3 characters." }).max(50, { message: "Semester name must be at most 50 characters." }),
  isPublic: z.boolean().default(true),
});

type SemesterFormValues = z.infer<typeof semesterFormSchema>;

interface SemesterSetupFormProps {
  onSemesterCreated: () => void; // Callback to close dialog or refresh list
}

export function SemesterSetupForm({ onSemesterCreated }: SemesterSetupFormProps) {
  const { createSemester, currentUser } = useAppContext();
  const { toast } = useToast();

  const form = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: {
      name: "",
      isPublic: true,
    },
  });

  function onSubmit(data: SemesterFormValues) {
    if (currentUser.role !== 'class_representative') {
      toast({ title: "Permission Denied", description: "Only class representatives can create semesters.", variant: "destructive" });
      return;
    }
    
    const newSemester = createSemester(data.name, data.isPublic);

    if (newSemester) {
      toast({
        title: "Semester (Server) Created!",
        description: `The semester "${data.name}" has been successfully created.`,
      });
      form.reset();
      onSemesterCreated(); 
    } else {
      toast({
        title: "Error",
        description: "Failed to create semester. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Semester (Server) Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Advanced Web Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Publicly Visible</FormLabel>
                <p className="text-xs text-muted-foreground">
                  If turned off, this semester (server) will be private. 
                  (Access control to be implemented in the future).
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5"/> Create Semester
        </Button>
      </form>
    </Form>
  );
}
