/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";
import { Input } from "@/app/ui/input";
import { Button } from "@/app/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/tabs";
import { useStore } from "@/lib/store";
import {
  convertBalance,
  convertNatToNumber,
  convertToNat,
  tokensToUnits,
} from "@/lib/utils";

export default function StakeDemo() {
  const {
    actor,
    authClient,
    principal,
    setUserBalance,
    setBalance,
    userBalance,
    setWithdrawBalance,
    withdrawBalance,
    ledgerActor,
  } = useStore();

  const [isDeposit, setIsDeposit] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>("");

  const fetchBalances = useCallback(async () => {
    if (!actor || !principal || !ledgerActor) {
      console.error("Missing required dependencies for fetching balances");
      return;
    }

    try {
      const vaultBalance = await actor.get_vault_balance();
      const userBalance = await actor.get_user_balance(
        Principal.fromText(principal)
      );

      setBalance(convertNatToNumber(vaultBalance.toString()));
      setUserBalance(convertNatToNumber(userBalance.toString()));

      const res = await ledgerActor.icrc1_balance_of({
        owner: Principal.fromText(principal),
        subaccount: [],
      });
      setWithdrawBalance(convertBalance(res));
    } catch (error) {
      console.error("Error fetching balances:", error);
      toast.error("Failed to fetch balances");
    }
  }, [
    actor,
    principal,
    ledgerActor,
    setBalance,
    setUserBalance,
    setWithdrawBalance,
  ]);

  useEffect(() => {
    if (actor && principal && ledgerActor) {
      fetchBalances();
    }
  }, [actor, principal, ledgerActor, fetchBalances]);

  const handleTransaction = async (type: "deposit" | "withdraw") => {
    if (!actor || !ledgerActor || !authClient || !amount || !principal) {
      toast.error("Please enter a valid amount and ensure you're logged in");
      return;
    }

    const units = tokensToUnits(amount, 8);
    if (!units) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const vaultPrincipal = Principal.fromText("asrmz-lmaaa-aaaaa-qaaeq-cai");
      const userPrincipal = Principal.fromText(principal);
      const amountNat = convertToNat(amount);
      let res;

      if (type === "deposit") {
        toast.loading("Checking allowance...");
        const allowanceResult = await ledgerActor.icrc2_allowance({
          account: { owner: userPrincipal, subaccount: [] },
          spender: { owner: vaultPrincipal, subaccount: [] },
        });
        const currentAllowance = BigInt(allowanceResult.allowance.toString());

        if (currentAllowance < units) {
          const feeAmount = BigInt(10000);
          const approveAmount = units + feeAmount;

          const approveRes = await ledgerActor.icrc2_approve({
            fee: [feeAmount],
            from_subaccount: [],
            memo: [],
            created_at_time: [],
            amount: approveAmount,
            expected_allowance: [],
            expires_at: [],
            spender: { owner: vaultPrincipal, subaccount: [] },
          });

          console.log("Approve response:", approveRes);
          if ("Err" in approveRes) {
            toast.error(`Approval failed: ${JSON.stringify(approveRes.Err)}`);
            return;
          }
          toast.success("Approval successful, depositing...");
        } else {
          res = await actor.deposit_icrc1(amountNat);
          console.log(`${type} result:`, res);
          toast.success(
            `${type.charAt(0).toUpperCase() + type.slice(1)} Successful`
          );
        }
      } else {
        res = await actor.withdraw_icrc1(amountNat);

        console.log(`${type} result:`, res);
        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} Successful`
        );
      }

      fetchBalances();
    } catch (error: any) {
      console.error(`${type} failed:`, error);
      toast.error(`${type} failed: ${error.message || JSON.stringify(error)}`);
    }
  };

  const handleAmountChange = (value: string) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, "");
    const parts = sanitizedValue.split(".");
    const wholePart = parts[0];
    const fractionalPart = parts[1] ? parts[1].slice(0, 8) : "";
    const newValue = wholePart + (fractionalPart ? "." + fractionalPart : "");
    setAmount(newValue);
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <Tabs
        defaultValue="deposit"
        onValueChange={(value) => {
          setAmount("");
          setIsDeposit(value === "deposit");
        }}
      >
        <TabsList className="mb-2 gap-1 bg-transparent">
          <TabsTrigger
            value="deposit"
            className="py-1.5 flex gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none duration-300 ease-in-out"
          >
            Deposit
          </TabsTrigger>
          <TabsTrigger
            value="withdraw"
            className="py-1.5 flex gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none duration-300 ease-in-out"
          >
            Withdraw
          </TabsTrigger>
        </TabsList>
        <TabsContent value="deposit">
          <AmountInput
            amount={amount}
            onChange={handleAmountChange}
            max={withdrawBalance}
            balance={withdrawBalance}
          />
        </TabsContent>
        <TabsContent value="withdraw">
          <AmountInput
            amount={amount}
            onChange={handleAmountChange}
            max={userBalance}
            balance={userBalance}
          />
        </TabsContent>
      </Tabs>

      <div className="shadow bg-white dark:bg-white/5 h-[340px] rounded-2xl p-4 duration-200 ease-in-out hover:bg-primary/5">
        about
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={() => handleTransaction("deposit")}
          disabled={!isDeposit || !amount}
        >
          Deposit
        </Button>
        <Button
          onClick={() => handleTransaction("withdraw")}
          disabled={isDeposit || !amount}
        >
          Withdraw
        </Button>
      </div>
    </div>
  );
}

interface AmountInputProps {
  amount: string;
  onChange: (value: string) => void;
  max?: number;
  balance?: number;
}

function AmountInput({ amount, onChange, balance }: AmountInputProps) {
  return (
    <div className="relative hover:bg-primary/5 ease-in-out duration-300 rounded-2xl">
      <div className="absolute top-3 left-4 text-sm text-foreground/80">
        Amount
      </div>
      <Input
        id="pay"
        placeholder="0"
        type="text"
        value={amount}
        onChange={(e) => onChange(e.target.value)}
        className="dark:bg-foreground/5 bg-white border-0 rounded-2xl focus-visible:ring-offset-0 focus-visible:ring-[0.2px] h-[120px] py-[40px] px-4"
      />
      <div className="absolute top-3 right-5">
        <div className="flex items-center border rounded-full p-1 w-7 h-7 bg-primary/20">
          <img
            src="/ICP.png"
            alt="icp"
            width={24}
            height={11.5}
            className="h-auto w-6"
          />
        </div>
      </div>
      <div className="absolute flex gap-1 bottom-4 left-4 text-xs text-muted-foreground/50">
        <div>${1000}</div>
      </div>
      <div className="absolute bottom-3 right-4 text-xs text-primary flex gap-0.5">
        <span className="py-1 text-foreground/80">{balance} ICP</span>
        <Button variant="ghost" size="xs">
          MAX
        </Button>
      </div>
    </div>
  );
}
