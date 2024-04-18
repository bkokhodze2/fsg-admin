export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
  return (
      <section className={"bg-red-800"}>
        <p>layout main header</p>
        {children}
        <p>layout main footer</p>
      </section>
  );
}
