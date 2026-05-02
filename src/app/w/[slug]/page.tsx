import WishPageClient from "./WishPageClient";

// Pre-render demo slugs for static export (GitHub Pages)
export function generateStaticParams() {
  return [{ slug: "demo" }, { slug: "sarah-birthday" }, { slug: "example" }];
}

export default function WishPage() {
  return <WishPageClient />;
}
