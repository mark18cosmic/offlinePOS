import { Card, CardHeader, CardContent } from "@/components/ui/card";
import React from 'react';

// interface DashboardCardProps {
//     title: string;
//     amount: string;
// }

const cardData = [
    {
        title: "Total revenue",
        amount: "$14,000"
    },
    {
        title: "Total Sales",
        amount: "100"
    },
    {
        title: "Daily Customers",
        amount: "20"
    }
];

const DashboardCards = () => {
  return (
    <div className="flex gap-4">
    {cardData.map((data, index) => (
      <Card key={index} className="flex-1 min-w-[200px] h-[150px]">
        <CardHeader>
          <h2 className="text-lg">{data.title}</h2>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{data.amount}</p>
        </CardContent>
      </Card>
    ))}
  </div>
  );
};

export default DashboardCards;
