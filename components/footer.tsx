import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter } from "lucide-react"

const footerLinks = {
  shop: [
    { name: "All Products", href: "/shop" },
    { name: "Agro Products", href: "/shop/agro" },
    { name: "Eco Friendly", href: "/shop/eco-friendly" },
    { name: "Herbal Products", href: "/shop/herbal" },
    { name: "Natural Cosmetics", href: "/shop/cosmetics" },
  ],

  ecoLibrary: [
    { name: "Flora & Fauna", href: "/eco-library/flora-fauna" },
    { name: "Gardening Tips", href: "/eco-library/gardening-tips" },
    { name: "Waste Management", href: "/eco-library/waste-management" },
    { name: "Plant Disease Detector", href: "/eco-library/plant-disease" },
  ],

}

export default function Footer() {
  return (
    <footer className="bg-green-50 border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center md:text-left">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.svg"
                alt="EcoSaro Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Your one-stop destination for eco-friendly products, services, and knowledge. Save nature, grow nature,
              and create impact.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground">Shop</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>



          <div>
            <h3 className="text-sm font-medium text-foreground">Eco Library</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.ecoLibrary.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; 2025 Watonezz LLP. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary mr-4">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
