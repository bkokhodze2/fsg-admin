'use client'

import React from "react";
import AddEditSeoPage from "@/app/(admin)/seo";

interface IPageProps {
  params: {
    id: string | number
  },
}

export default function SeoPageEdit({params}: IPageProps) {


  return (
      <AddEditSeoPage id={params.id as number}/>
  );
}
