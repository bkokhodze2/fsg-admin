'use client'
import React from "react";
import AddEditInfoAdv from "../../add-info-adv";

interface IPageProps {
  params: {
    id: string | number
  },
  searchParams: {
    id: number
  }
}

export default function EditInfoAdv({params, searchParams}: IPageProps) {
  return (
      <AddEditInfoAdv id={params.id as number}/>
  );
}
