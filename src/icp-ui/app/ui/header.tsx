import { Button } from "@/app/ui/button";

export default function Header() {
  return (
    <div className="mx-10 mt-3 px-6 rounded-2xl py-4 fixed top-0 left-0 bg-[#01100c] right-0 z-50 flex justify-between items-center">
      <div className="flex gap-2 text-3xl font-normal items-center font-michroma">
        <div className="relative cursor-pointer items-center justify-center ">
          <p className="text-xl font-semibold">EigenFi</p>
          <p className="absolute rounded-[5px] border border-white text-primary top-[6px] -right-8 text-[10px] px-[3px] pb-0.5">
            icp
          </p>
        </div>
      </div>
      <Button>Connect Wallet</Button>
    </div>
  );
}
