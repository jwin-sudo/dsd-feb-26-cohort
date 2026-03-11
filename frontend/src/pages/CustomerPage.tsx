import CustomerHeader from "@/components/CustomerHeader";
import LocationCard from "@/components/LocationCard";
import ServiceStatusCard from "@/components/ServiceStatusCard";
import ServiceHistoryCard from "@/components/ServiceHistoryCard";
import ServiceIssuesCard from "@/components/ServiceIssuesCard";

import type { Customer } from "@/types/customer";

import { mockCustomer } from "@/assets/mockCustomer";

const CustomerPage = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(
    null,
  );
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(
    null,
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedContainer, setSubmittedContainer] = useState<string | null>(
    null,
  );
  const [submittedServiceType, setSubmittedServiceType] = useState<
    string | null
  >(null);

  // const isPickupDay =
  //   new Date().toDateString() ===
  //   new Date(customer.serviceJob.scheduledPickup).toDateString();

  useEffect(() => {
    setCustomer(mockCustomer);
    setLoading(false);
  }, []);
  if (loading || !customer) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex justify-center align-items-center flex-col p-6">
      <CustomerHeader
        location={`${customer.location.city}, ${customer.location.state}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-stretch">
        <div className="flex flex-col gap-4">
          <LocationCard
            location={customer.location}
            serviceJob={customer.serviceJob}
            selectedContainer={selectedContainer}
            setSelectedContainer={setSelectedContainer}
            selectedServiceType={selectedServiceType}
            setSelectedServiceType={setSelectedServiceType}
            onSubmit={() => {
              setSubmittedContainer(selectedContainer);
              setSubmittedServiceType(selectedServiceType);
              setIsSubmitted(true);
            }}
          />
          <ServiceHistoryCard serviceHistory={customer.serviceHistory} />
        </div>
        <div className="flex flex-col gap-4">
          <ServiceStatusCard
            serviceJob={{
              ...customer.serviceJob,
              container: submittedContainer ?? customer.serviceJob.container,
              serviceType:
                submittedServiceType ?? customer.serviceJob.serviceType,
            }}
            isSubmitted={isSubmitted}
            isPickupDay={false}
          />
          <ServiceIssuesCard issues={customer.serviceIssues} />
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;

