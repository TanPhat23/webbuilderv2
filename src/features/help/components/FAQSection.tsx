import { ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    category: string;
    items: FAQItem[];
}

interface FAQSectionProps {
    faqs: FAQCategory[];
    searchQuery: string;
    expandedFAQ: number | null;
    setExpandedFAQ: (index: number | null) => void;
}

export default function FAQSection({ faqs, searchQuery, expandedFAQ, setExpandedFAQ }: FAQSectionProps) {
    const filteredFAQs = faqs.map(category => ({
        ...category,
        items: category.items.filter(item =>
            searchQuery === "" ||
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

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

    if (filteredFAQs.length === 0) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="py-12 text-center">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        Not found your answer? Please contact our support team for further assistance.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 w-full max-w-4xl mx-auto">
            {filteredFAQs.map((category, categoryIndex) => (
                <motion.div
                    key={categoryIndex}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={staggerContainer}
                >
                    <motion.h3
                        className="text-xl font-semibold mb-4 flex items-center gap-2 text-left"
                        variants={fadeInUp}
                    >
                        <ChevronRight className="w-5 h-5 text-primary" />
                        {category.category}
                    </motion.h3>
                    <div className="space-y-3">
                        {category.items.map((item, itemIndex) => {
                            const globalIndex = categoryIndex * 100 + itemIndex;
                            const isExpanded = expandedFAQ === globalIndex;

                            return (
                                <motion.div key={itemIndex} variants={fadeInUp}>
                                    <Card
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => setExpandedFAQ(isExpanded ? null : globalIndex)}
                                    >
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base font-semibold flex items-start justify-between gap-4">
                                                <span className="flex-1">{item.question}</span>
                                                {isExpanded ? (
                                                    <ChevronDown className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        {isExpanded && (
                                            <CardContent className="pt-0">
                                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                                    {item.answer}
                                                </p>
                                            </CardContent>
                                        )}
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}