'use client'
import AddEditTenderDoc from "./index";
import React, {Suspense} from "react";

export default function TenderDocAdd() {
  return (
      <Suspense fallback={"loading..."}>
        <AddEditTenderDoc/>
      </Suspense>
  );
}
