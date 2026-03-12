import { Card, CardContent } from "@/components/ui/card";
import type { ServiceIssue } from "@/types/customer";
import { TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ServiceIssuesCardProps = {
  issues: ServiceIssue[];
};

const ServiceIssuesCard = ({ issues }: ServiceIssuesCardProps) => {
  const navigate = useNavigate();

  const formatCompletedAt = (completed_at?: string | null) => {
    const completedAt = completed_at ? new Date(completed_at) : null;
    return completedAt && !Number.isNaN(completedAt.getTime())
      ? completedAt.toLocaleString("en-US", { timeZone: "America/Chicago" })
      : null;
  };

  return (
    <Card className="flex-1">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <TriangleAlert size={20} className="text-green-700" />
          <p className="font-bold">Service Issues</p>
        </div>

        {issues.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No Issues Reported
          </p>
        ) : (
          issues.map((issue) => (
            <div key={issue.jobId} className="p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <p className="text-sm font-semibold text-red-600">
                  {issue.reason}
                </p>
              </div>

              {issue.hasProof ? (
                <button
                  type="button"
                  className="text-left"
                  onClick={() => navigate(`/proof?job=${issue.jobId}`)}
                >
                  <p className="text-sm text-gray-600 underline">View proof</p>
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Proof photo has not been uploaded yet.
                </p>
              )}

              <p className="text-xs text-gray-500">
                {formatCompletedAt(issue.completedAt) ??
                  "Completion time unavailable"}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
export default ServiceIssuesCard;
