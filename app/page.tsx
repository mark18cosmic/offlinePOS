import DashboardCards from "@/components/DashboardCards";
import RecentTransactionTable from "@/components/tables/recentTransactionTable";

export default function Home() {
  return (
    <main className="m-12">
      <header>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="font-light text-base">Analayze key data and metrics with precise tools.</p>
      </header>
      <section className="py-8">
        <DashboardCards />
      </section>
      <hr />
      <section className="py-8">
        <h1 className="text-2xl font-semibold">Recent Transactions</h1>
        <p className="font-light text-base">All recent transactions made in the past week.</p>   
        <div className="py-8">
            <RecentTransactionTable />
        </div> 
        <hr />  
        </section>
    </ main>
  );
}
