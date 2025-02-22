"use client";

import { Input } from "@/app/ui/input";
import { Button } from "@/app/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/tabs";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function StakeDemo() {
  const [deposit, setDeposit] = useState<boolean>(true);
  return (
    <div className="flex flex-col w-full">
      <Tabs
        defaultValue="deposit"
        onValueChange={(value) => {
          // setAmount("");
          setDeposit(value === "deposit");
        }}
      >
        <TabsList className="mb-2 gap-1 bg-transparent">
          <TabsTrigger
            value="deposit"
            className="py-1.5 flex gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none duration-300 ease-in-out"
          >
            <span
              className={cn(
                deposit
                  ? "size-1.5 rounded-full bg-black animate-pulse"
                  : "hidden "
              )}
              aria-hidden="true"
            />
            Deposit
          </TabsTrigger>
          <TabsTrigger
            value="withdraw"
            className="py-1.5 flex gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none duration-300 ease-in-out"
          >
            <span
              className={cn(
                !deposit
                  ? "size-1.5 rounded-full bg-black animate-pulse"
                  : "hidden "
              )}
              aria-hidden="true"
            />
            Withdraw
          </TabsTrigger>
        </TabsList>
        <TabsContent value="deposit">
          <div className="relative hover:bg-primary/5 ease-in duration-75 rounded-2xl">
            <div className="absolute top-3 left-4 text-sm text-foreground/80">
              Amount
            </div>
            <Input
              id="pay"
              placeholder="0"
              // disabled={isPending || Number.parseInt(maxAmount) <= 0}
              type="number"
              // value={amount}
              // onChange={(e) => handleAmountChange(e.target.value)}
              step="any"
              min="0"
              // max={Number.parseInt(maxAmount) || undefined}
              className="bg-white/5 border-0 rounded-2xl focus-visible:ring-offset-0 focus-visible:ring-[0.2px] h-[120px] py-[40px] px-4"
            />
            <div className="absolute top-3 right-5">
              <div className="flex items-center border rounded-full p-1 w-7 h-7 bg-primary/20">
                <Image
                  src={"/ICP.png"}
                  alt="icp"
                  width={24}
                  height={11.5}
                  className="h-auto w-6"
                />
              </div>
            </div>
            {/* <Select defaultValue="movement">
              <SelectTrigger
                id="framework"
                className="absolute top-1/4 w-22 right-3"
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
               {isLoading ? (
              <SelectItem value="movement">
                <Skeleton className="w-16 h-5 rounded-md" />{" "}
              </SelectItem>
            ) : (
              <SelectItem value="movement">${tokenSymbol}</SelectItem>
            )} 
                <SelectItem value="movement">${"ICP"}</SelectItem>
              </SelectContent>
            </Select> */}
            <div className="absolute flex gap-1 bottom-4 left-4 text-xs text-muted-foreground/50">
              {/* {isLoading ? (
            <Skeleton className="w-16 h-5 rounded-md" />
          ) : (
            <div>
              <span>{formatNumber(maxAmount)}</span>
              <span> ${tokenSymbol}</span>
            </div>
          )} */}
              <div>${1000}</div>
            </div>
            <div className="absolute bottom-3 right-4 text-xs text-primary flex gap-0.5">
              <span className="py-1 text-foreground/80"> 100 ICP</span>
              <Button variant={"ghost"} size="xs">
                MAX
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="withdraw">
          <div className="relative hover:bg-primary/5 ease-in duration-75 rounded-2xl">
            <div className="absolute top-3 left-4 text-sm text-foreground/80">
              Amount
            </div>
            <Input
              id="pay"
              placeholder="0"
              // disabled={isPending || Number.parseInt(maxAmount) <= 0}
              type="number"
              // value={amount}
              // onChange={(e) => handleAmountChange(e.target.value)}
              step="any"
              min="0"
              // max={Number.parseInt(maxAmount) || undefined}
              className="bg-white/5 border-0 rounded-2xl focus-visible:ring-offset-0 focus-visible:ring-[0.2px] h-[120px] py-[40px] px-4"
            />
            <div className="absolute top-3 right-5">
              <div className="flex items-center border rounded-full p-1 w-7 h-7 bg-primary/20">
                <Image
                  src={"/ICP.png"}
                  alt="icp"
                  width={24}
                  height={11.5}
                  className="h-auto w-6"
                />
              </div>
            </div>
            {/* <Select defaultValue="movement">
              <SelectTrigger
                id="framework"
                className="absolute top-1/4 w-22 right-3"
              >
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
               {isLoading ? (
              <SelectItem value="movement">
                <Skeleton className="w-16 h-5 rounded-md" />{" "}
              </SelectItem>
            ) : (
              <SelectItem value="movement">${tokenSymbol}</SelectItem>
            )} 
                <SelectItem value="movement">${"ICP"}</SelectItem>
              </SelectContent>
            </Select> */}
            <div className="absolute flex gap-1 bottom-4 left-4 text-xs text-muted-foreground/50">
              {/* {isLoading ? (
            <Skeleton className="w-16 h-5 rounded-md" />
          ) : (
            <div>
              <span>{formatNumber(maxAmount)}</span>
              <span> ${tokenSymbol}</span>
            </div>
          )} */}
              <div>${1000}</div>
            </div>
            <div className="absolute bottom-3 right-4 text-xs text-primary flex gap-0.5">
              <span className="py-1 text-foreground/80"> 100 ICP</span>
              <Button variant={"ghost"} size="xs">
                MAX
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
