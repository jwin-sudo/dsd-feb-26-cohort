import { useEffect, useState } from "react";
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

  useEffect(() => {
    setCustomer(mockCustomer);
    setLoading(false);

  }, []);
  if (loading || !customer) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <CustomerHeader location={`${customer.location.city}, ${customer.location.state}`} />
      <LocationCard location={customer.location} serviceJob={customer.serviceJob} />

    </div>

  )
}

export default CustomerPage;