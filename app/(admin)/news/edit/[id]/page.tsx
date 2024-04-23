'use client'
import AddEditNews from "@/app/(admin)/news";
import React, {useState} from "react";
import {useRouter} from "next/navigation";

interface IPageProps {
  params: {
    id: string | number
  },
  searchParams: {
    id: number
  }
}

export default function NewsEdit({params, searchParams}: IPageProps) {

  console.log("ppp-sss", params, searchParams)

  return (
      <AddEditNews id={params.id as number}/>
  );
}
