'use client'
import React from "react";
import AddEditTimelineCard from "../../add-card";

interface IPageProps {
  params: {
    id: string | number
  },
  searchParams: {
    id: number
  }
}

export default function TimelineCardEdit({params, searchParams}: IPageProps) {


  return (
      <AddEditTimelineCard id={params.id as number}/>
  );
}
