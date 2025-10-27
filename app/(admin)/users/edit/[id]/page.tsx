"use client";
import AddEditManagementPerson from "@/app/(admin)/users";
import React from "react";

interface IPageProps {
  params: {
    id: string | number;
  };
  searchParams: {
    id: number;
  };
}

export default function ManagementPersonEdit({
  params,
  searchParams,
}: IPageProps) {
  return <AddEditManagementPerson id={params.id as number} />;
}
