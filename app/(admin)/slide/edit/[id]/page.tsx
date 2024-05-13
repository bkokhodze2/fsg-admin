'use client'
import AddEditSlide from "@/app/(admin)/slide";
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

export default function SlideEdit({params, searchParams}: IPageProps) {


  return (
      <AddEditSlide id={params.id as number}/>
  );
}
