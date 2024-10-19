"use client";
import dynamic from "next/dynamic";
const Main= dynamic(() => import("../components/Main"), { ssr: false });
const Contribute = dynamic(() => import("../components/Contribute"), { ssr: false });


export default function Home() {
  return (
    <Main>
      {/* Dashboard Header Section */}
      {/* <UserDashboard /> */}

      {/* Grid Layout for DeFi Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12 px-4">
        {/* Left Column: Contribute & Governance */}
        <div className="space-y-10">
          <Contribute/>
          {/* <WinnerRedeem/> */}


        </div>

        {/* Middle Column: Lending/Borrowing & Staking */}
        <div className="space-y-10">

        </div>

        {/* Right Column: Yield Farming & Funds ReDeem */}
        <div className="space-y-10">

        </div>
      </div>
    </Main>
  );
}
