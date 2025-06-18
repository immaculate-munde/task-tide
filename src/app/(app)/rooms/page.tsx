
import { getSemesters, getUnitsBySemester, getDocumentsByUnit, assignmentGroups } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid, Folder, Users } from "lucide-react";

const unitCardColors = [
  "bg-pink-600", "bg-green-600", "bg-sky-600", "bg-amber-600", 
  "bg-purple-600", "bg-teal-600", "bg-rose-600", "bg-indigo-600",
  "bg-lime-600", "bg-cyan-600", "bg-fuchsia-600", "bg-orange-600"
];

export default async function RoomsPage() {
  const semesters = getSemesters();

  return (
    <div className="container mx-auto py-2">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary flex items-center">
          <LayoutGrid className="mr-3 h-10 w-10" /> Unit Rooms
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Browse units by semester. Each unit is a 'room' containing documents and group information.
        </p>
      </header>

      {semesters.length > 0 ? (
        semesters.map((semester, semesterIndex) => (
          <section key={semester.id} className="mb-12">
            <h2 className="text-3xl font-semibold font-headline text-primary mb-6 border-b pb-2">
              {semester.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {getUnitsBySemester(semester.id).map((unit, unitIndex) => {
                const colorIndex = (semesterIndex * getUnitsBySemester(semester.id).length + unitIndex) % unitCardColors.length;
                const cardColor = unitCardColors[colorIndex];
                const documentsForUnit = getDocumentsByUnit(semester.id, unit.id);
                const groupsForUnit = assignmentGroups.filter(group => group.unitId === unit.id && group.semesterId === semester.id);

                return (
                  <Link href={`/rooms/${semester.id}/${unit.id}`} key={unit.id} className="block group">
                    <Card className={`h-56 ${cardColor} text-primary-foreground overflow-hidden relative transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl flex flex-col justify-between p-4`}>
                      <div className="relative z-10">
                        <Image 
                          src={`https://placehold.co/80x80.png`}
                          alt="Abstract unit art"
                          width={60}
                          height={60}
                          className="absolute -right-2 -top-2 opacity-30 group-hover:opacity-50 transform rotate-12 scale-100 transition-all duration-300"
                          data-ai-hint="abstract pattern"
                        />
                        <CardTitle className="text-lg font-semibold leading-tight drop-shadow-md mt-2">
                          {unit.name}
                        </CardTitle>
                      </div>
                      <div className="relative z-10 mt-auto">
                        <div className="flex items-center text-xs opacity-80 group-hover:opacity-100 transition-opacity">
                          <Folder className="w-3 h-3 mr-1.5" />
                          <span>{documentsForUnit.length} Document{documentsForUnit.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center text-xs opacity-80 group-hover:opacity-100 transition-opacity mt-1">
                          <Users className="w-3 h-3 mr-1.5" />
                          <span>{groupsForUnit.length} Group{groupsForUnit.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
            {getUnitsBySemester(semester.id).length === 0 && (
              <p className="text-muted-foreground">No units found for this semester.</p>
            )}
          </section>
        ))
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-xl text-muted-foreground">No semesters found.</p>
            <p className="mt-2">Please check back later or contact an administrator.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

