import { useEffect, useMemo, useState } from "react";
import DriverDashHeader from "./DriverDashHeader";
import StopCard from "./StopCard";
import RouteHealtCard from "./RouteHealtCard";
import RouteListCard from "./RouteListCard";
import { fetchManifestJobs, generateDriverManifest, type DriverManifestResponse } from "@/api/driverManifest";
import type { Stop, Route } from "@/types/driver";

function todayIsoDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildRoute(manifest: DriverManifestResponse): Route | null {
  if (!manifest.route) return null;

  const stops: Stop[] = [...manifest.jobs]
    .sort((a, b) => (a.sequence_order ?? 9999) - (b.sequence_order ?? 9999))
    .map((job) => ({
      location_id: job.location_id,
      sequence_order: job.sequence_order ?? 0,
      customer_name: job.customer_name ?? "Unknown",
      address: job.address?.street_address ?? "",
      city: job.address?.city ?? "",
      state: job.address?.state ?? "",
      zip: job.address?.zipcode ?? "",
      service: job.job_source,
      container: "Mixed",
      status: job.status,
      is_extra_pickup: job.job_source === "EXTRA_REQUEST",
      failure_reason: null,
      proof_of_service_photo: null,
    }));

  return {
    route_id: String(manifest.route.route_id),
    service_date: manifest.route.service_date,
    city: manifest.route.start_city ?? "Dallas",
    state: manifest.route.start_state ?? "TX",
    stops,
    health: {
      stops_remaining: stops.filter((s) => s.status === "PENDING").length,
      completed: stops.filter((s) => s.status === "COMPLETED").length,
      skipped: stops.filter((s) => s.status === "SKIPPED").length,
      extra_pickups: stops.filter((s) => s.is_extra_pickup).length,
    },
  };
}

const DriverDashboard = () => {
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = todayIsoDate();
    fetchManifestJobs(today)
      .then(async (data) => {
        if (!data.route) {
          const generated = await generateDriverManifest(today);
          setRoute(buildRoute(generated));
        } else {
          setRoute(buildRoute(data));
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const currentStop = useMemo(
    () => route?.stops.find((s) => s.status === "PENDING") ?? route?.stops[0] ?? null,
    [route],
  );

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!route || !currentStop) return <div className="p-6">No route for today.</div>;

  return (
    <div className="p-6">
      <DriverDashHeader
        routeId={route.route_id}
        location={`${route.city}, ${route.state}`}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1.4fr]">
        <div className="space-y-4">
          <StopCard stop={currentStop} />
          <RouteHealtCard health={route.health} />
        </div>
        <RouteListCard
          stops={route.stops}
          currentStopLocationId={currentStop.location_id}
        />
      </div>
    </div>
  );
};

export default DriverDashboard;
