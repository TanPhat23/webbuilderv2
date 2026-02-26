"use client";

import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { useInView } from "@/hooks";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Freelance Designer",
    avatar: "S",
    content:
      "WebBuilder revolutionized how I create websites for clients. The drag-and-drop interface is so intuitive, and being able to export clean React code means I can customize further if needed.",
    rating: 5,
  },
  {
    name: "Mike Rodriguez",
    role: "Restaurant Owner",
    avatar: "M",
    content:
      "I built my restaurant's website in just 2 hours with WebBuilder. No coding knowledge needed, and it looks completely professional. My online orders increased by 60%!",
    rating: 5,
  },
  {
    name: "Emma Thompson",
    role: "Marketing Agency Founder",
    avatar: "E",
    content:
      "WebBuilder saves us weeks of development time. We can prototype, design, and launch client websites incredibly fast. The component library is fantastic.",
    rating: 5,
  },
];

export default function LandingPageTestimonials() {
  const [ref, inView] = useInView();

  return (
    <section
      ref={ref}
      id="testimonials"
      className="py-24 bg-gradient-to-r from-primary/5 via-background to-accent/5"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div
          className={`text-center mb-20 transition-all duration-1000 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              creators worldwide
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our community is saying about WebBuilder
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-700 hover:-translate-y-2 group ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary group-hover:scale-110 transition-transform duration-300"
                      style={{
                        transitionDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
                <CardDescription className="text-base leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors duration-300">
                  "{testimonial.content}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-semibold text-lg group-hover:scale-110 transition-transform duration-300">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
