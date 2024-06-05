'use client'
import AddEditInfoCard from "@/app/(admin)/info-card";
import React from "react";

interface IPageProps {
  params: {
    id: string | number
  },
  searchParams: {
    id: number
  }
}

export default function InfoCardEdit({params, searchParams}: IPageProps) {


  return (
      <AddEditInfoCard id={params.id as number}/>
  );
}
