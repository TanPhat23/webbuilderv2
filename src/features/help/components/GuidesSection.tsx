import { BookOpen, ChevronRight, HelpCircle, Mail, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const guides = [
    {
        title: "Getting Started Guide",
        description: "Learn basic usage from A-Z",
        link: "/docs/getting-started",
        duration: "5 min read"
    },
    {
        title: "Video Tutorials",
        description: "Watch detailed tutorial videos",
        link: "/docs/videos",
        duration: "15+ videos"
    },
    {
        title: "Templates & Examples",
        description: "Explore ready-made template library",
        link: "/templates",
        duration: "100+ templates"
    },
    {
        title: "API Documentation",
        description: "For advanced developers",
        link: "/docs/api",
        duration: "Full documentation"
    },
    {
        title: "Blog & Tutorials",
        description: "Tips, tricks and latest updates",
        link: "/blog",
        duration: "Updated weekly"
    },
    {
        title: "Community",
        description: "Join the discussion forum",
        link: "/community",
        duration: "5000+ members"
    }
];

export default function GuidesSection() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
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
                <h2 className="mb-2 text-2xl font-bold">User Guides</h2>
                <p className="text-muted-foreground">
                    Detailed documentation and guides for effective use
                </p>
            </motion.div>

            <motion.div
                className="grid w-full max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={staggerContainer}
            >
                {guides.map((guide, index) => (
                    <motion.div key={index} variants={fadeInUp}>
                        <Card
                            className="group h-full cursor-pointer bg-secondary/20 transition-all duration-300 hover:border-primary hover:shadow-lg"
                            onClick={() => window.location.href = guide.link}
                        >
                            <CardContent className="pt-6">
                                <div className="mb-3 flex items-start justify-between">
                                    <BookOpen className="h-6 w-6 text-primary" />
                                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{guide.title}</h3>
                                <p className="mb-3 text-sm text-muted-foreground">
                                    {guide.description}
                                </p>
                                <p className="text-xs font-medium text-primary">
                                    {guide.duration}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Additional Resources */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl"
            >
                <Card className="bg-secondary/20 shadow-md">
                    <CardHeader>
                        <CardTitle>Additional Resources</CardTitle>
                        <CardDescription>
                            Other learning and support resources
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <motion.div
                            className="grid gap-4 md:grid-cols-2"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <motion.div
                                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                variants={fadeInUp}
                            >
                                <BookOpen className="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <h4 className="mb-1 font-semibold">Changelog</h4>
                                    <p className="text-sm text-muted-foreground">
                                        View new features and updates
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div
                                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                variants={fadeInUp}
                            >
                                <MessageCircle className="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <h4 className="mb-1 font-semibold">Community Forum</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Connect with other users
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div
                                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                variants={fadeInUp}
                            >
                                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <h4 className="mb-1 font-semibold">Newsletter</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Subscribe to weekly newsletter
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div
                                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                variants={fadeInUp}
                            >
                                <HelpCircle className="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <h4 className="mb-1 font-semibold">Status Page</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Check system status
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
}