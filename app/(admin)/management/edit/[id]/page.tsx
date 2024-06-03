'use client'
import AddEditManagementPerson from "@/app/(admin)/management";
import React from "react";
// import {useRouter} from "next/navigation";

interface IPageProps {
  params: {
    id: string | number
  },
  searchParams: {
    id: number
  }
}

export default function ManagementPersonEdit({params, searchParams}: IPageProps) {


  return (
      <AddEditManagementPerson id={params.id as number}/>
  );
}
