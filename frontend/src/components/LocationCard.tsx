import type { CustomerLocation, ServiceJob } from "@/types/customer";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type LocationCardProps = {
  location: CustomerLocation;
  serviceJob: ServiceJob;

};

const LocationCard = ({ location, serviceJob }: LocationCardProps) => {
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(serviceJob.serviceType ?? null);
  const [isEditing, setIsEditing] = useState(false);


  const handleSubmit = async () => {
    if (!selectedServiceType || !serviceJob.requestFormOpen) return;

    try {

      // will call the api when ready to submit the form
      console.log("Submitted:", selectedServiceType);
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };
  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-2 items-start">
            <MapPin className="text-green-700 mt-1" size={20} />
            <div>
              <p className="font-bold text-xl">{location.name}</p>
              <p className="text-sm font-semibold">{location.street}, {location.city}, {location.state} {location.zip}</p>
            </div>
          </div>
          {serviceJob.serviceType && serviceJob.requestFormOpen && !isEditing && (
            <button
              className="text-sm cursor-pointer hover:underline"
              onClick={() => {
                setIsEditing(true);
                setSelectedServiceType(null);
              }}
            >
              Edit
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-4 h-4 rounded-full ${serviceJob.requestFormOpen ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm font-semibold">
            {serviceJob.requestFormOpen ? "REQUEST FORM OPEN" : "REQUEST FORM CLOSE"}
          </span>
        </div>
        <p className="text-sm"><span className="font-semibold">Scheduled Pickup:</span> {serviceJob.scheduledPickup}</p>
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-sm"><span className="font-semibold">Container:</span> {serviceJob.container}</p>
          <p className="text-sm font-semibold">Service Type:</p>
          {["normal_pickup", "extra_pickup", "skip_pickup"].map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm capitalize">
              <input
                type="radio"
                name="serviceType"
                value={type}
                checked={selectedServiceType === type}
                onChange={() => setSelectedServiceType(type)}
                disabled={!serviceJob.requestFormOpen || (!!serviceJob.serviceType && !isEditing)}
              />
              {type.replace("_", " ")}
            </label>
          ))}
        </div>
        <Button onClick={handleSubmit} disabled={!serviceJob.requestFormOpen} className={`w-full ${!serviceJob.requestFormOpen ? "bg-gray-300 text-gray-500" : "bg-green-700 text-white"} cursor-pointer`} variant="ghost">
          SUBMIT
        </Button>



      </CardContent>
    </Card>

  )
}

export default LocationCard;