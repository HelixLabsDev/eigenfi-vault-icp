import Abuot from "@/app/ui/about";
import StakeDemo from "@/app/ui/stake";
import { Component } from "@/app/ui/chart-1";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/tabs";
import { Component2 } from "./ui/chart-2";

export default function Home() {
  return (
    <div className="flex gap-24 w-full items-start p-10 pt-12 rounded-2xl relative">
      <div className="flex flex-col gap-12">
        <h1 className="text-6xl font-light">
          ICP <span className="text-muted-foreground">Vault</span>
        </h1>
        <p className="text-muted-foreground text-lg font-light leading-6">
          The ICP Vault is a decentralized platform that allows users to store
          their ICP tokens in a secure and accessible manner. With the ICP
          Vault, users can easily transfer their ICP tokens to other users,
          enabling seamless and secure transactions.
        </p>

        <div className="flex gap-6 justify-between">
          <div className="flex flex-col gap-2 mt-6 text-xl text-foreground/80 font-light">
            <p>Total Deposits</p>
            <p className="text-3xl text-foreground">
              26.38<span>k</span>
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-6 text-xl text-foreground/80 font-light">
            <p>Liquidity</p>
            <p className="text-3xl text-foreground">
              12.74
              <span>k</span>
            </p>
          </div>
          <div className="flex flex-col gap-2 mt-6 text-xl text-foreground/80 font-light">
            <p>APY</p>
            <p className="text-3xl text-foreground">
              4.18<span>%</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <Tabs defaultValue="tab-1" className="items-center relative">
            <div className="absolute w-full border-b top-10" />
            <TabsList className="h-auto rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="tab-1"
                className="text-base data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Vault
              </TabsTrigger>
              <TabsTrigger
                value="tab-2"
                className="text-base data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                My Account
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab-1" className="py-4">
              <Component />
            </TabsContent>
            <TabsContent value="tab-2" className="py-4">
              <Component2 />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-[740px] mt-12 sticky top-5">
        <StakeDemo />
        <Abuot />
      </div>
    </div>
  );
}
