"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function HelpAndSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Animation variants
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

  const faqs = [
    {
      category: "Tài khoản",
      items: [
        {
          question: "Làm thế nào để tạo tài khoản mới?",
          answer:
            "Bạn có thể tạo tài khoản bằng cách nhấn vào nút 'Đăng ký' ở góc trên bên phải. Điền thông tin email và mật khẩu, sau đó xác nhận email để hoàn tất đăng ký. Quá trình này chỉ mất vài phút.",
        },
        {
          question: "Tôi quên mật khẩu, phải làm sao?",
          answer:
            "Tại trang đăng nhập, nhấn vào 'Quên mật khẩu?'. Nhập email đã đăng ký, chúng tôi sẽ gửi link khôi phục mật khẩu đến email của bạn trong vòng 5 phút. Kiểm tra cả hộp thư spam nếu không thấy email.",
        },
        {
          question: "Làm sao để thay đổi thông tin cá nhân?",
          answer:
            "Vào 'Cài đặt' > 'Hồ sơ cá nhân', bạn có thể cập nhật tên, ảnh đại diện, số điện thoại và các thông tin liên hệ khác. Nhớ nhấn 'Lưu thay đổi' sau khi chỉnh sửa.",
        },
      ],
    },
    {
      category: "Thanh toán & Gói dịch vụ",
      items: [
        {
          question: "Các gói dịch vụ có gì khác nhau?",
          answer:
            "Chúng tôi cung cấp 3 gói:\n• Miễn phí: Tính năng cơ bản, 3 trang web, 1GB dung lượng\n• Pro (299.000đ/tháng): Không giới hạn trang, 10GB dung lượng, tên miền tùy chỉnh\n• Enterprise (999.000đ/tháng): Không giới hạn, hỗ trợ ưu tiên 24/7, API tùy chỉnh",
        },
        {
          question: "Làm thế nào để nâng cấp tài khoản?",
          answer:
            "Vào 'Cài đặt' > 'Gói dịch vụ', chọn gói phù hợp và nhấn 'Nâng cấp'. Chúng tôi hỗ trợ thanh toán qua thẻ ATM, Visa/MasterCard, MoMo và chuyển khoản. Tài khoản được nâng cấp ngay lập tức sau thanh toán thành công.",
        },
        {
          question: "Tôi có thể hủy đăng ký bất cứ lúc nào không?",
          answer:
            "Có, bạn hoàn toàn có thể hủy đăng ký bất cứ lúc nào trong 'Cài đặt' > 'Gói dịch vụ' > 'Hủy đăng ký'. Gói dịch vụ sẽ vẫn hoạt động đến hết chu kỳ thanh toán hiện tại. Không mất phí hủy.",
        },
        {
          question: "Có chính sách hoàn tiền không?",
          answer:
            "Có, chúng tôi có chính sách hoàn tiền 100% trong vòng 30 ngày đầu tiên nếu bạn không hài lòng với dịch vụ. Liên hệ bộ phận hỗ trợ để được xử lý nhanh chóng.",
        },
      ],
    },
    {
      category: "Bảo mật & Dữ liệu",
      items: [
        {
          question: "Dữ liệu của tôi có được bảo mật không?",
          answer:
            "An toàn dữ liệu là ưu tiên hàng đầu của chúng tôi. Chúng tôi sử dụng:\n• Mã hóa SSL/TLS 256-bit\n• Tuân thủ GDPR và các chuẩn bảo mật quốc tế\n• Sao lưu tự động hàng ngày\n• Xác thực hai yếu tố (2FA)\n• Máy chủ đặt tại Việt Nam và Singapore",
        },
        {
          question: "Tôi có thể xuất dữ liệu của mình không?",
          answer:
            "Có, bạn có thể xuất toàn bộ dữ liệu của mình dưới dạng JSON, CSV hoặc backup đầy đủ trong 'Cài đặt' > 'Dữ liệu & Quyền riêng tư' > 'Xuất dữ liệu'. File sẽ được gửi đến email của bạn.",
        },
        {
          question: "Làm sao để bật xác thực hai yếu tố?",
          answer:
            "Vào 'Cài đặt' > 'Bảo mật' > 'Xác thực hai yếu tố'. Quét mã QR bằng ứng dụng Google Authenticator hoặc Authy, sau đó nhập mã xác nhận. Chúng tôi khuyến nghị bật tính năng này để tăng cường bảo mật.",
        },
      ],
    },
    {
      category: "Tính năng & Sử dụng",
      items: [
        {
          question: "Làm thế nào để tạo trang web mới?",
          answer:
            "Vào Dashboard, nhấn nút 'Tạo trang mới' ở góc trên. Chọn template có sẵn hoặc bắt đầu từ trang trắng. Sử dụng trình soạn thảo kéo-thả để tùy chỉnh theo ý muốn, sau đó nhấn 'Xuất bản'.",
        },
        {
          question: "Tôi có thể sử dụng tên miền riêng không?",
          answer:
            "Có, với gói Pro trở lên, bạn có thể kết nối tên miền riêng. Vào 'Cài đặt trang web' > 'Tên miền', nhập tên miền và làm theo hướng dẫn cấu hình DNS. Quá trình này thường mất 24-48 giờ để hoàn tất.",
        },
        {
          question: "Làm sao để tối ưu SEO cho trang web?",
          answer:
            "Vào 'Cài đặt trang' > 'SEO', bạn có thể tùy chỉnh:\n• Tiêu đề và mô tả meta\n• Từ khóa\n• Open Graph tags cho mạng xã hội\n• Sitemap tự động\n• Tốc độ trang được tối ưu sẵn",
        },
        {
          question: "Trang web có tương thích với mobile không?",
          answer:
            "Có, tất cả trang web được tạo trên nền tảng của chúng tôi đều tự động responsive, hiển thị tốt trên mọi thiết bị từ desktop, tablet đến smartphone. Bạn có thể xem trước trên nhiều kích thước màn hình.",
        },
      ],
    },
  ];

  const supportChannels = [
    {
      icon: Mail,
      title: "Email",
      description: "Gửi email cho chúng tôi",
      contact: "support@webbuilder.vn",
      link: "mailto:support@webbuilder.vn",
      responseTime: "Trả lời trong 24h",
    },
    {
      icon: Phone,
      title: "Hotline",
      description: "Gọi điện trực tiếp",
      contact: "1900 2468",
      link: "tel:19002468",
      responseTime: "T2-T6: 8h-18h",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat trực tiếp với tư vấn viên",
      contact: "Khả dụng 24/7",
      link: "#",
      responseTime: "Phản hồi ngay lập tức",
    },
  ];

  const guides = [
    {
      title: "Hướng dẫn bắt đầu",
      description: "Tìm hiểu cách sử dụng cơ bản từ A-Z",
      link: "/docs/getting-started",
      duration: "5 phút đọc",
    },
    {
      title: "Video hướng dẫn",
      description: "Xem các video hướng dẫn chi tiết",
      link: "/docs/videos",
      duration: "15+ videos",
    },
    {
      title: "Template & Ví dụ",
      description: "Khám phá thư viện template có sẵn",
      link: "/templates",
      duration: "100+ mẫu",
    },
    {
      title: "Tài liệu API",
      description: "Dành cho developers nâng cao",
      link: "/docs/api",
      duration: "Tài liệu đầy đủ",
    },
    {
      title: "Blog & Tutorials",
      description: "Mẹo, thủ thuật và cập nhật mới",
      link: "/blog",
      duration: "Cập nhật hàng tuần",
    },
    {
      title: "Cộng đồng",
      description: "Tham gia diễn đàn thảo luận",
      link: "/community",
      duration: "5000+ thành viên",
    },
  ];

  const filteredFAQs = faqs
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          searchQuery === "" ||
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0);

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
            Trợ Giúp & Hỗ Trợ
          </Badge>
          <h1 className="bg-gradient-to-b from-foreground to-foreground/30 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
            Trung Tâm Trợ Giúp & Hỗ Trợ
          </h1>
          <p
            className="max-w-2xl pt-2 text-lg
                    text-muted-foreground"
          >
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Tìm câu trả lời nhanh chóng cho
            câu hỏi của bạn hoặc liên hệ trực tiếp với đội ngũ hỗ trợ chuyên
            nghiệp của chúng tôi.
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
          <Card className="bg-secondary/20 shadow-md">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi, ví dụ: 'quên mật khẩu', 'nâng cấp tài khoản'..."
                  className="h-12 bg-background pl-10 pr-4 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
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
              <TabsTrigger
                value="faq"
                className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                FAQ
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Liên hệ
              </TabsTrigger>
              <TabsTrigger
                value="guides"
                className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Hướng dẫn
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent
              value="faq"
              className="mt-8 flex w-full flex-col items-center space-y-6"
            >
              {filteredFAQs.length === 0 ? (
                <Card className="w-full max-w-4xl mx-auto">
                  <CardContent className="py-12 text-center">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Không tìm thấy câu hỏi phù hợp. Thử tìm kiếm từ khóa khác
                      hoặc liên hệ hỗ trợ.
                    </p>
                  </CardContent>
                </Card>
              ) : (
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
                                onClick={() =>
                                  setExpandedFAQ(
                                    isExpanded ? null : globalIndex,
                                  )
                                }
                              >
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base font-semibold flex items-start justify-between gap-4">
                                    <span className="flex-1">
                                      {item.question}
                                    </span>
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
              )}
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent
              value="contact"
              className="mt-8 flex w-full flex-col items-center space-y-6"
            >
              <motion.div
                className="mb-6 text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                <h2 className="mb-2 text-2xl font-bold">Liên Hệ Hỗ Trợ</h2>
                <p className="text-muted-foreground">
                  Chọn phương thức liên hệ phù hợp với bạn
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
                    <CardTitle>Giờ Làm Việc</CardTitle>
                    <CardDescription>
                      Thời gian hoạt động của bộ phận hỗ trợ khách hàng
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Thứ Hai - Thứ Sáu:</span>
                        <span className="text-muted-foreground">
                          8:00 - 18:00
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Thứ Bảy:</span>
                        <span className="text-muted-foreground">
                          8:00 - 12:00
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Chủ Nhật & Ngày Lễ:</span>
                        <span className="text-muted-foreground">Đóng cửa</span>
                      </div>
                      <div className="pt-4 bg-primary/5 rounded-lg p-4 mt-4">
                        <p className="text-sm text-center">
                          <strong className="text-primary">Lưu ý:</strong> Live
                          Chat hoạt động 24/7. Email được trả lời trong vòng 24
                          giờ làm việc. Hotline chỉ hoạt động trong giờ hành
                          chính.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Contact Form */}
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
                    <CardTitle>Gửi Tin Nhắn Nhanh</CardTitle>
                    <CardDescription>
                      Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại sớm
                      nhất
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          placeholder="Họ và tên"
                          className="bg-background"
                        />
                        <Input
                          type="email"
                          placeholder="Email"
                          className="bg-background"
                        />
                      </div>
                      <Input placeholder="Chủ đề" className="bg-background" />
                      <textarea
                        className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Nội dung tin nhắn..."
                      />
                      <Button className="w-full" size="lg">
                        <Send className="mr-2 h-4 w-4" />
                        Gửi Tin Nhắn
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Guides Tab */}
            <TabsContent
              value="guides"
              className="mt-8 flex w-full flex-col items-center space-y-6"
            >
              <motion.div
                className="mb-6 text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                <h2 className="mb-2 text-2xl font-bold">Hướng Dẫn Sử Dụng</h2>
                <p className="text-muted-foreground">
                  Tài liệu và hướng dẫn chi tiết để bạn sử dụng hiệu quả
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
                      onClick={() => (window.location.href = guide.link)}
                    >
                      <CardContent className="pt-6">
                        <div className="mb-3 flex items-start justify-between">
                          <BookOpen className="h-6 w-6 text-primary" />
                          <ChevronRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">
                          {guide.title}
                        </h3>
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
                    <CardTitle>Tài Nguyên Bổ Sung</CardTitle>
                    <CardDescription>
                      Các nguồn học tập và hỗ trợ khác
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
                            Xem các tính năng mới và cập nhật
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                        variants={fadeInUp}
                      >
                        <MessageCircle className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <h4 className="mb-1 font-semibold">
                            Diễn đàn cộng đồng
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Kết nối với người dùng khác
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
                            Đăng ký nhận tin tức hàng tuần
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
                            Kiểm tra tình trạng hệ thống
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
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
                Vẫn Chưa Tìm Thấy Câu Trả Lời?
              </h3>
              <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn với bất
                kỳ câu hỏi nào
              </p>
              <Button size="lg" className="gap-2">
                <Mail className="h-5 w-5" />
                Liên Hệ Với Chúng Tôi
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
