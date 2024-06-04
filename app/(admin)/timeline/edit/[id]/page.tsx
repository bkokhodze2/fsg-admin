'use client'
import AddEditTimeline from "@/app/(admin)/timeline";
import React from "react";

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
      <AddEditTimeline id={Number(params.id) as number}/>
  );
}
