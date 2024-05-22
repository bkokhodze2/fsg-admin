'use client'
import AddEditTimelineCard from "../index";
import React, {useState} from "react";

interface IPageProps {
  params: {
    id?: string | number
    parentId?: string | number
  },
  searchParams: {
    id: number
  }
}

export default function TimelineCardAdd({params, searchParams}: IPageProps) {
  return (
      <AddEditTimelineCard parentId={Number(params.parentId) as number}  />
  );
}
