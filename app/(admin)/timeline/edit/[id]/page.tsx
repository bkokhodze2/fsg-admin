'use client'
import AddEditTimeline from "@/app/(admin)/timeline";
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

export default function TimelineEdit({params, searchParams}: IPageProps) {


  return (
      <AddEditTimeline id={params.id as number}/>
  );
}
