'use client'
import AddEditDepartment from "@/app/(admin)/department";
import React from "react";

interface IPageProps {
  params: {
    id: string | number
  },
  searchParams: {
    id: number
  }
}

export default function DepartmentEdit({params, searchParams}: IPageProps) {


  return (
      <AddEditDepartment id={params.id as number}/>
  );
}
