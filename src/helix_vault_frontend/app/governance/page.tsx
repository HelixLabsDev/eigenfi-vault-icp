import React from "react";
import { FeedbackDataTable } from "../ui/FeedbackDataTable";
import FeedbackDialog from "../ui/FeedbackDialog";

export default function Governance() {
  const data = [
    {
      id: "proposal-1",
      title: "Title 1",
      description: "Description 1",
      status: "approved",
      createdAt: "2023-07-01",
      updatedAt: "2023-07-01",
      action: "Approved",
    },
    {
      id: "proposal-2",
      title: "Title 2",
      description: "Description 2",
      status: "approved",
      createdAt: "2023-07-01",
      updatedAt: "2023-07-01",
      action: "Approved",
    },
    {
      id: "proposal-3",
      title: "Title 3",
      description: "Description 3",
      status: "pending",
      createdAt: "2023-07-01",
      updatedAt: "2023-07-01",
      action: "Approved",
    },
  ];
  return (
    <div className="container mx-auto pt-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Governance</h1>
        <FeedbackDialog />
      </div>
      <FeedbackDataTable data={data} />
    </div>
  );
}
