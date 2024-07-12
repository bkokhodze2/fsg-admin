'use client'
import React from "react";
import AddEditPartner from "./index";

interface IPageProps {
  params: {
    id?: string | number
    parentId?: string | number
  },
  searchParams: {
    id: number
  }
}

export default function AddPartner({params, searchParams}: IPageProps) {
  return (
      <AddEditPartner parentId={Number(params.parentId) as number}  />
  );
}
