import StockCard from '@/components/stockCard'
import React from 'react'

const page = () => {
    return (
        <main className="m-12">
            <header>
                <h1 className="text-2xl font-semibold">Make a Sale</h1>
                <p className="font-light text-base">Sell an item that is available in stock.</p>
            </header>
            <section className='py-8'>
                <StockCard />
            </section>

        </ main>)
}

export default page