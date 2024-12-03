import InventoryCard from '@/components/inventoryCard'
import React from 'react'

const InventoryPage = () => {
    return (
        <div className='m-12'>
            <header>
                <h1 className="text-2xl font-semibold">Inventory</h1>
                <p className="font-light text-base">View and order stock.</p>
            </header>   
            <section className='py-8'>
                <InventoryCard />
            </section>
         </div>
    )
}

export default InventoryPage