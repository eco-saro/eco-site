import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Linkedin } from "lucide-react"

export default function ContactSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Get Involved</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join our mission to create a greener, more sustainable world.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-bold">Email Us</h3>
                <p className="text-gray-500">Support@ecosaro.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-bold">Call Us</h3>
                <p className="text-gray-500">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-bold">Visit Us</h3>
                <p className="text-gray-500">123 Green Street, Chennai, Tamil Nadu, India</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-8">
              <Button asChild variant="outline" size="icon" className="rounded-full">
                <a href="https://www.linkedin.com/company/ecosaro-a-unit-of-watonezz-llp/" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Send us a message</h3>
              <p className="text-gray-500">Have questions or want to collaborate? Reach out to us.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Name
                  </label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Message
                </label>
                <Textarea id="message" placeholder="Enter your message" className="min-h-[120px]" />
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">Send Message</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
