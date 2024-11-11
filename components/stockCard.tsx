import React from 'react'
import { Card, CardHeader, CardContent } from './ui/card';
import { ChefHat, CupSoda, DrumstickIcon } from 'lucide-react';
const cardData = [
    {
        title: "Burger",
        price: "65",
        icon: ChefHat
    },
    {
        title: "Chicken",
        price: "30",
        icon: DrumstickIcon
    },
    {
        title: "Soda",
        price: "15",
        icon: CupSoda
    }
];

const StockCard = () => {
  return (
    <div className="flex gap-4">
    {cardData.map((data, index) => (
      <Card key={index} className="flex-1 cursor-pointer hover:shadow-md min-w-[200px] h-[150px]">
        <CardHeader className='flex justify-center items-center'>
            <data.icon/>
        </CardHeader>
        <CardContent className='flex flex-col gap-1 items-center justify-center'>
          <p className="text-xl font-sembibold">{data.title}</p>
          <p>MVR {data.price}</p>
        </CardContent>
      </Card>
    ))}
  </div>  )
}

export default StockCard