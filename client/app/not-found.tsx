import { NotFound } from "@/components/ui/error-404-page"

export const metadata = {
  title: "404 - Page Not Found | Filox",
  description: "Oops! The page you're looking for seems to be lost in the clouds.",
}

export default function NotFoundPage() {
  return <NotFound />
}
