'use client'

import React from "react";
import AddEditCustomPage from "@/app/(admin)/custom-page";

interface IPageProps {
  params: {
    id: string | number
  },
}

export default function CustomPageEdit({params}: IPageProps) {


  return (
      <AddEditCustomPage id={params.id as number}/>
  );
}
