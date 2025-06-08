"use client";
import Link from "next/link";
import { Skeleton } from "./skeleton";
import { Badge } from "@/app/ui/badge";

export default function MainnetCard() {
  // const { totalStaked, isLoadingPool, apr } = usePoolStore();

  return (
    <div className="md:w-1/2 w-full md:p-0 p-6">
      <Link
        prefetch
        href="/icp"
        className="p-8 group rounded-4xl border flex flex-col gap-6 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between w-full py-2">
          <div className="flex items-center duration-150 ease-in-out gap-4">
            <picture>
              <img
                src="/helix.png"
                alt="icp"
                width={24}
                height={11.5}
                className="h-auto w-8 ms-2"
              />
            </picture>
            <div className="relative cursor-pointer items-center justify-center">
              <p className="text-2xl font-semibold font-michroma">EigenFi</p>
            </div>
          </div>
          <div>
            <Badge variant={"outline"}>
              <div className="w-1 h-1 animate-pulse bg-primary rounded-full" />
              Mainnet
            </Badge>
          </div>
        </div>
        <div className="py-4 px-6 bg-zinc-100 dark:bg-black rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between border-b py-6">
            <div className="w-1/2 border-r flex flex-col gap-2">
              <p className="text-foreground/70 text-base">Vault</p> <p> ICP</p>
            </div>
            <div className="flex flex-col justify-between">
              <p className="text-foreground/70 text-base">Total Deposits</p>{" "}
              <div className="text-end w-full text-xl">
                {/* {isLoadingPool ? ( */}
                <Skeleton className="h-4 w-24" />
                {/* ) : (
                  totalStaked
                )} */}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <p className="text-foreground/70 text-base">Apr</p>{" "}
            <div className="text-lg">
              <Skeleton className="h-4 w-24" />
              {/* {isLoadingPool ? <Skeleton className="h-4 w-24" /> : apr + "%"} */}
            </div>
          </div>
          <div className="flex justify-between">
            <p className="text-foreground/70 text-base">Network</p>{" "}
            <picture className="flex items-center border rounded-full p-1 w-7 h-7 bg-primary">
              <img
                src="/icp-logo.png"
                alt="icp"
                width={24}
                height={11.5}
                className="h-auto w-6 invert"
              />
            </picture>
          </div>
        </div>
      </Link>
    </div>
  );
}
