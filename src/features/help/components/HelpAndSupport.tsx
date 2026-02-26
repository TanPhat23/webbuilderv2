"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, HelpCircle, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import HelpSearch from "./HelpSearch";
import FAQSection from "./FAQSection";
import ContactSection from "./ContactSection";
import GuidesSection from "./GuidesSection";

export const faqs = [
    {
        category: "Account",
        items: [
            {
                question: "How to create a new account?",
                answer: "You can create an account by clicking the 'Sign Up' button in the top right corner. Fill in your email and password, then verify your email to complete registration. This process only takes a few minutes."
            },
            {
                question: "I forgot my password, what should I do?",
                answer: "On the login page, click 'Forgot Password?'. Enter your registered email, and we will send a password recovery link to your email within 5 minutes. Check your spam folder if you don't see the email."
            },
            {
                question: "How to change personal information?",
                answer: "Go to 'Settings' > 'Personal Profile', where you can update your name, profile picture, phone number, and other contact information. Remember to click 'Save Changes' after editing."
            }
        ]
    },
    {
        category: "Payment & Service Plans",
        items: [
            {
                question: "What are the differences between service plans?",
                answer: "We offer 3 plans:\n• Free: Basic features, 3 websites, 1GB storage\n• Pro (299,000đ/month): Unlimited pages, 10GB storage, custom domain\n• Enterprise (999,000đ/month): Unlimited, 24/7 priority support, custom API"
            },
            {
                question: "How to upgrade my account?",
                answer: "Go to 'Settings' > 'Service Plan', select the appropriate plan and click 'Upgrade'. We support payment via ATM card, Visa/MasterCard, MoMo, and bank transfer. Your account is upgraded immediately after successful payment."
            },
            {
                question: "Can I cancel my subscription at any time?",
                answer: "Yes, you can cancel your subscription at any time in 'Settings' > 'Service Plan' > 'Cancel Subscription'. The service plan will remain active until the end of the current billing cycle. No cancellation fees."
            },
            {
                question: "Is there a refund policy?",
                answer: "Yes, we have a 100% refund policy within the first 30 days if you are not satisfied with the service. Contact our support team for quick processing."
            }
        ]
    },
    {
        category: "Security & Data",
        items: [
            {
                question: "Is my data secure?",
                answer: "Data security is our top priority. We use:\n• 256-bit SSL/TLS encryption\n• GDPR compliance and international security standards\n• Daily automatic backups\n• Two-factor authentication (2FA)\n• Servers located in Vietnam and Singapore"
            },
            {
                question: "Can I export my data?",
                answer: "Yes, you can export all your data in JSON, CSV, or full backup format in 'Settings' > 'Data & Privacy' > 'Export Data'. The file will be sent to your email."
            },
            {
                question: "How to enable two-factor authentication?",
                answer: "Go to 'Settings' > 'Security' > 'Two-Factor Authentication'. Scan the QR code with Google Authenticator or Authy app, then enter the verification code. We recommend enabling this feature for enhanced security."
            }
        ]
    },
    {
        category: "Features & Usage",
        items: [
            {
                question: "How to create a new website?",
                answer: "In the Dashboard, click the 'Create New Page' button in the top corner. Choose an available template or start from a blank page. Use the drag-and-drop editor to customize as desired, then click 'Publish'."
            },
            {
                question: "Can I use my own domain?",
                answer: "Yes, with Pro plan and above, you can connect your own domain. Go to 'Website Settings' > 'Domain', enter your domain name and follow the DNS configuration instructions. This process usually takes 24-48 hours to complete."
            },
            {
                question: "How to optimize SEO for my website?",
                answer: "Go to 'Page Settings' > 'SEO', where you can customize:\n• Meta title and description\n• Keywords\n• Open Graph tags for social media\n• Automatic sitemap\n• Pre-optimized page speed"
            },
            {
                question: "Is the website mobile-friendly?",
                answer: "Yes, all websites created on our platform are automatically responsive, displaying well on all devices from desktop, tablet to smartphone. You can preview on multiple screen sizes."
            }
        ]
    }
];

export default function HelpAndSupport() {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <section className="relative w-full overflow-hidden px-4 py-24 sm:px-8">
            {/* Background gradients */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-[10%] left-[50%] h-[40%] w-[60%] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-8">
                {/* Header */}
                <motion.div
                    className="flex flex-col items-center space-y-2"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                >
                    <Badge
                        variant="outline"
                        className="mb-4 rounded-full border-primary/20 bg-primary/5 px-4 py-1 text-sm font-medium"
                    >
                        <Sparkles className="mr-1 h-3.5 w-3.5 animate-pulse text-primary" />
                        Help & Support
                    </Badge>
                    <h1 className="bg-gradient-to-b from-foreground to-foreground/30 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                        Help & Support Center
                    </h1>
                    <p className="max-w-2xl pt-2 text-lg text-muted-foreground">
                        We are always ready to help you. Find quick answers to your questions
                        or contact our professional support team directly.
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-2xl"
                >
                    <HelpSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full"
                >
                    <Tabs defaultValue="faq" className="w-full">
                        <TabsList className="mx-auto grid w-full max-w-md grid-cols-3 bg-muted/30">
                            <TabsTrigger value="faq" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">FAQ</TabsTrigger>
                            <TabsTrigger value="contact" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">Contact</TabsTrigger>
                            <TabsTrigger value="guides" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">Guides</TabsTrigger>
                        </TabsList>

                        <TabsContent value="faq" className="mt-8 flex w-full flex-col items-center space-y-6">
                            <FAQSection
                                faqs={faqs}
                                searchQuery={searchQuery}
                                expandedFAQ={expandedFAQ}
                                setExpandedFAQ={setExpandedFAQ}
                            />
                        </TabsContent>

                        <TabsContent value="contact" className="mt-8 flex w-full flex-col items-center space-y-6">
                            <ContactSection />
                        </TabsContent>

                        <TabsContent value="guides" className="mt-8 flex w-full flex-col items-center space-y-6">
                            <GuidesSection />
                        </TabsContent>
                    </Tabs>
                </motion.div>

                {/* Footer CTA */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-4xl"
                >
                    <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg">
                        <CardContent className="py-12 text-center">
                            <HelpCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                            <h3 className="mb-3 text-2xl font-bold">
                                Still Haven't Found an Answer?
                            </h3>
                            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                                Our support team is always ready to help you with any questions
                            </p>
                            <Button size="lg" className="gap-2">
                                <Mail className="h-5 w-5" />
                                Contact Us
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </section>
    );
}
