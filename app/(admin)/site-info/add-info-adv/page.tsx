'use client'
import React from "react";
import AddEditInfoAdv from "./index";

interface IPageProps {
  params: {
    id?: string | number
    parentId?: string | number
  },
  searchParams: {
    id: number
  }
}

export default function AddInfoAdv({params, searchParams}: IPageProps) {
  return (
      <AddEditInfoAdv parentId={Number(params.parentId) as number}  />
  );
}
