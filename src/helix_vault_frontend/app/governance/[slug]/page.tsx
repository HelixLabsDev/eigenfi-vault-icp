/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export async function generateStaticParams() {
  // Example: Replace this with real data source
  const slugs = ["proposal-1", "proposal-2", "proposal-3"];

  return slugs.map((slug) => ({ slug }));
}

export default async function Feedback({ params }: any) {
  const { slug } = await params;

  console.log("slug", slug);

  //test data
  const body = {
    id: "1",
    title: "Title 1",
    description: "Description 1",
    status: "approved",
    createdAt: "2023-07-01",
    updatedAt: "2023-07-01",
    action: "Approved",
  };

  return (
    <div className="container mx-auto pt-6">
      <div className="ms-6">
        <Link href={"/governance"}>
          <ArrowLeft className="w-5 h-5 cursor-pointer" />
        </Link>
      </div>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold border-b pb-4">
            Governance Detail
          </h1>
          <h2 className="text-2xl font-bold">{body.title}</h2>
          <p className="text-gray-600">{body.description}</p>
          <p className="text-sm text-gray-400">
            Created: {dayjs(body.createdAt).format("MMM D, YYYY h:mm A")}
          </p>
        </div>
      </div>
    </div>
  );
}
