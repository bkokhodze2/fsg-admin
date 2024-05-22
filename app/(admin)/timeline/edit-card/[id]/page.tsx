'use client'
import React, {useState} from "react";
// import {useRouter} from "next/navigation";
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
