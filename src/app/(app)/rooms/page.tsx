
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function RoomsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center justify-center">
            <Info className="mr-3 h-8 w-8" />
            Welcome to Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please select a semester from the left sidebar to view its units.
          </p>
          <p className="text-muted-foreground mt-2">
            If no semesters are visible, please contact an administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
