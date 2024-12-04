import React from 'react'
import { cardData } from './stockCard'
import { Card, CardHeader, CardContent } from './ui/card'

const InventoryCard = () => {
    return (
        <div className="grid grid-cols-5 gap-4">
        {cardData.map((data, index) => (
          <Card key={index} className="flex-1 cursor-pointer hover:shadow-md min-w-[200px] h-[150px]">
            <CardHeader className='flex justify-center items-center'>
                <data.icon/>
            </CardHeader>
            <CardContent className='flex flex-col gap-1 items-center justify-center'>
              <p className="text-xl font-sembibold">{data.title}</p>
              <p className={data.stock === "Out of Stock" ? "text-red-500 font-semibold" : "text-black"}>
                {data.stock}
            </p>
            </CardContent>
          </Card>
        ))}
      </div>  )
}

export default InventoryCard