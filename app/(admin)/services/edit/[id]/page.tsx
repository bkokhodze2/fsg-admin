"use client";
import AddEditServiceCenter from "@/app/(admin)/services";
import React from "react";

interface IPageProps {
  params: {
    id: string | number;
  };
  searchParams: {
    id: number;
  };
}

export default function ServiceCenterEdit({
  params,
  searchParams,
}: IPageProps) {
  return <AddEditServiceCenter id={params.id as number} />;
}
