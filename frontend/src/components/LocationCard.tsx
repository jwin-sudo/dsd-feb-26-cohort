import type { CustomerLocation, ServiceJob } from "@/types/customer";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type LocationCardProps = {
  location: CustomerLocation;
  serviceJob: ServiceJob;
  selectedContainer: string | null;
  setSelectedContainer: (val: string | null) => void;
  selectedServiceType: string | null;
  setSelectedServiceType: (val: string | null) => void;
  onSubmit?: () => void;
};

const LocationCard = ({
  location,
  serviceJob,
  selectedContainer,
  setSelectedContainer,
  selectedServiceType,
  setSelectedServiceType,
  onSubmit,
}: LocationCardProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSubmit = async () => {
    if (
      !selectedContainer ||
      !selectedServiceType ||
      !serviceJob.requestFormOpen
    )
      return;

    try {
      console.log("Submitted:", { selectedContainer, selectedServiceType });
      setSubmitted(true);
      setEditing(false);

      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  const canEdit = serviceJob.requestFormOpen && (!submitted || editing);

  const isSubmitEnabled = canEdit && selectedContainer && selectedServiceType;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {/* Location */}
        <div className="flex justify-between items-start">
          <div className="flex gap-2 items-start">
            <MapPin className="text-green-700 mt-1" size={20} />
            <div>
              <p className="font-bold text-xl">{location.name}</p>
              <p className="text-sm font-medium">
                {location.street}, {location.city}, {location.state}{" "}
                {location.zip}
              </p>
            </div>
          </div>
          {submitted && serviceJob.requestFormOpen && !editing && (
            <Button
              size="sm"
              variant="outline"
              className="text-gray-500 border-gray-400"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>

        {/* Request Form Status */}
        <div className="flex items-center gap-2">
          <span
            className={` w-4 h-4 rounded-full 
            ${
              serviceJob.requestFormOpen
                ? "bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.7)] animate-pulse"
                : "bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.7)] animate-pulse"
            }
  `}
          />
          <span className="text-sm font-semibold">
            {serviceJob.requestFormOpen
              ? "REQUEST FORM OPEN"
              : "REQUEST FORM CLOSED"}
          </span>
        </div>

        {/* Scheduled Pickup */}
        <p className="text-sm">
          <span className="font-semibold">Scheduled Pickup:</span>
          {serviceJob.scheduledPickup}
        </p>

        {/* Container & Service Type */}
        <div className="flex flex-col mt-2 mb-4 gap-4">
          {/* Container */}
          <div>
            <p className="text-sm font-semibold">Container:</p>
            {canEdit ? (
              <Select
                value={selectedContainer ?? ""}
                onValueChange={(val) => setSelectedContainer(val)}
              >
                <SelectTrigger className="w-[50%] cursor-pointer">
                  <SelectValue>
                    {selectedContainer
                      ? `${selectedContainer}`
                      : "Select Container Size"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 yd</SelectItem>
                  <SelectItem value="10">10 yd</SelectItem>
                  <SelectItem value="20">20 yd</SelectItem>
                  <SelectItem value="30">30 yd</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="w-40 p-2 bg-gray-100 text-gray-500 rounded-md">
                {selectedContainer
                  ? `${selectedContainer} yd`
                  : "No Container Selected"}
              </div>
            )}
          </div>

          {/* Service Type */}
          <div>
            <p className="text-sm font-semibold">Service Type:</p>
            {canEdit ? (
              <Select
                value={selectedServiceType ?? ""}
                onValueChange={(val) => setSelectedServiceType(val)}
              >
                <SelectTrigger className="w-[50%] cursor-pointer">
                  <SelectValue>
                    {selectedServiceType
                      ? selectedServiceType.replace("_", " ").toUpperCase()
                      : "Select Service Type"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal_pickup">Normal Pickup</SelectItem>
                  <SelectItem value="extra_pickup">Extra Pickup</SelectItem>
                  <SelectItem value="skip_pickup">Skip Pickup</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="w-40 p-2 bg-gray-100 text-gray-500 rounded-md">
                {selectedServiceType
                  ? selectedServiceType.replace("_", " ").toUpperCase()
                  : "No Service Type Selected"}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
          className={`w-full cursor-pointer ${
            isSubmitEnabled
              ? "bg-green-700 text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          SUBMIT
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
