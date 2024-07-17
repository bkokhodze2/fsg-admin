'use client'
import AddEditBCard from "@/app/(admin)/b-card";
import React from "react";

interface IPageProps {
  params: {
    id: string | number
  },
  searchParams: {
    id: number
  }
}

export default function BCardEdit({params, searchParams}: IPageProps) {


  return (
      <AddEditBCard id={params.id as number}/>
  );
}
