import React from 'react'
import { Card, CardHeader, CardContent } from './ui/card';
import { Pizza, IceCream, Salad, Coffee, Donut, Drumstick, CupSoda, ChefHat, Beef, Martini, Shell, EggFried, Soup, Fish } from "lucide-react";
export const cardData = [
  {
    title: "Burger",
    price: "65",
    icon: ChefHat,
    stock: "25"
},
{
    title: "Chicken",
    price: "30",
    icon: Drumstick,
    stock: "40"
},
{
    title: "Soda",
    price: "15",
    icon: CupSoda,
    stock: "100"
},
{
    title: "Pizza",
    price: "85",
    icon: Pizza,
    stock: "15"
},
{
    title: "Hot Dog",
    price: "40",
    icon: Fish,
    stock: "Out of Stock"
},
{
    title: "French Fries",
    price: "25",
    icon: Soup,
    stock: "60"
},
{
    title: "Ice Cream",
    price: "20",
    icon: IceCream,
    stock: "50"
},
{
    title: "Pasta",
    price: "70",
    icon: Shell,
    stock: "20"
},
{
    title: "Salad",
    price: "50",
    icon: Salad,
    stock: "35"
},
{
    title: "Coffee",
    price: "30",
    icon: Coffee,
    stock: "80"
},
{
    title: "Donut",
    price: "15",
    icon: Donut,
    stock: "75"
},
{
    title: "Milkshake",
    price: "35",
    icon: Martini,
    stock: "40"
},
{
    title: "Taco",
    price: "60",
    icon: EggFried,
    stock: "25"
},
{
    title: "Steak",
    price: "120",
    icon: Beef,
    stock: "10"
}

];

const StockCard = () => {
  return (
    <div className="grid grid-cols-5 gap-4">
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