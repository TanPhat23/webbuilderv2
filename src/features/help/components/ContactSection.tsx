import { Clock, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const supportChannels = [
  {
    icon: Mail,
    title: "Email",
    description: "Send us an email",
    contact: "support@webbuilder.vn",
    link: "mailto:support@webbuilder.vn",
    responseTime: "Reply within 24h",
  },
  {
    icon: Phone,
    title: "Hotline",
    description: "Call us directly",
    contact: "1900 2468",
    link: "tel:19002468",
    responseTime: "Mon-Fri: 8am-6pm",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat directly with our consultant",
    contact: "Available 24/7",
    link: "#",
    responseTime: "Instant response",
  },
];

export default function ContactSection() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      <motion.div
        className="mb-6 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-2 text-2xl font-bold">Contact Support</h2>
        <p className="text-muted-foreground">
          Choose the contact method that suits you
        </p>
      </motion.div>

      <motion.div
        className="mb-8 grid w-full max-w-6xl gap-6 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        {supportChannels.map((channel, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card
              className="group h-full cursor-pointer bg-secondary/20 transition-all duration-300 hover:border-primary hover:shadow-lg"
              onClick={() => (window.location.href = channel.link)}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <channel.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">
                    {channel.title}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {channel.description}
                  </p>
                  <p className="mb-2 font-medium text-primary">
                    {channel.contact}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {channel.responseTime}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Working Hours */}
      <WorkingHours />

      {/* Quick Contact Form */}
      <QuickContactForm />
    </>
  );
}

function WorkingHours() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl"
    >
      <Card className="bg-secondary/20 shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>Customer support operating hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Monday - Friday:</span>
              <span className="text-muted-foreground">8:00 - 18:00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Saturday:</span>
              <span className="text-muted-foreground">8:00 - 12:00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Sunday & Holidays:</span>
              <span className="text-muted-foreground">Closed</span>
            </div>
            <div className="pt-4 bg-primary/5 rounded-lg p-4 mt-4">
              <p className="text-sm text-center">
                <strong className="text-primary">Note:</strong> Live Chat
                operates 24/7. Emails are answered within 24 business hours.
                Hotline only operates during business hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function QuickContactForm() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-2xl"
    >
      <Card className="bg-secondary/20 shadow-md">
        <CardHeader>
          <CardTitle>Send Quick Message</CardTitle>
          <CardDescription>
            Fill in the information below and we will contact you as soon as
            possible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Full name" className="bg-background" />
              <Input
                type="email"
                placeholder="Email"
                className="bg-background"
              />
            </div>
            <Input placeholder="Subject" className="bg-background" />
            <textarea
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Message content..."
            />
            <Button className="w-full" size="lg">
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
