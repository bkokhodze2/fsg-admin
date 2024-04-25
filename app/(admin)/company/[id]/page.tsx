'use client'

interface IPageProps {
  params: {
    id: string | number
  },
  searchParams: {
    aba: string
  }
}

export default function CompanyDetails({params, searchParams}: IPageProps) {

  return (
      <main className="p-24">
        company details page {params.id} {searchParams.aba}
      </main>
  );
}

