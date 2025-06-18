
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSemesterById } from "@/lib/data";
import { Info, NotebookText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SemesterRoomPageProps {
  params: {
    semesterId: string;
  };
}

export default async function SemesterRoomPage({ params }: SemesterRoomPageProps) {
  const semester = getSemesterById(params.semesterId);

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
              The semester you are looking for does not exist.
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
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center justify-center">
            <NotebookText className="mr-3 h-8 w-8" />
            {semester.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            Please select a unit from the sidebar to view its documents and groups.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            You are currently viewing materials for <strong>{semester.name}</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Optional: If you want to pre-render paths for semesters
export async function generateStaticParams() {
  const { getSemesters } = await import("@/lib/data");
  const semesters = getSemesters();
  return semesters.map(semester => ({ semesterId: semester.id }));
}
