
type CustomerHeaderProps = {
  customerName: string;
  location: string;
};

const CustomerHeader = ({ customerName, location }: CustomerHeaderProps) => {
  const date = new Date();
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex flex-col">
        <span className="font-medium">{date.toDateString()}</span>
        <span className="text-sm text-gray-600">{customerName}</span>
      </div>
      <span className="font-medium text-right">{location}</span>
    </div>
  );
};

export default CustomerHeader;
