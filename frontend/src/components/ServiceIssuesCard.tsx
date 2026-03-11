import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

type ServiceIssue = {
  reason: string;
  photoUrl?: string;
};

type ServiceIssuesCardProps = {
  issues: ServiceIssue[];
};

const ServiceIssuesCard = ({ issues }: ServiceIssuesCardProps) => {
  return (
    <Card className="flex-1">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Info size={20} className="text-green-700" />
          <p className="font-bold">Service Issues</p>
        </div>

        {issues.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No Issues Reported
          </p>
        ) : (
          issues.map((issue, i) => (
            <div
              key={i}
              className="border rounded-md p-3 flex flex-col gap-2 bg-red-50"
            >
           
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <p className="text-sm font-semibold text-red-600">
                  {issue.reason}
                </p>
              </div>

              
              {issue.photoUrl && (
                <img
                  src={issue.photoUrl}
                  alt="Driver proof"
                  className="rounded-md max-h-48 object-cover border"
                />
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceIssuesCard;
