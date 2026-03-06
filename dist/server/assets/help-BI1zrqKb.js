import { f as Badge, I as Input, T as Tabs, g as TabsList, h as TabsTrigger, i as TabsContent, B as Button } from "./prisma-Cq49YOYM.js";
import { jsxs, jsx } from "react/jsx-runtime";
import "clsx";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Search, HelpCircle, ChevronRight, ChevronDown, Mail, Phone, MessageCircle, Clock, Send, BookOpen } from "lucide-react";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./card-LOcGasZb.js";
import "sonner";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "react-hook-form";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
function HelpAndSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState(null);
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
  const faqs = [
    {
      category: "Tài khoản",
      items: [
        {
          question: "Làm thế nào để tạo tài khoản mới?",
          answer: "Bạn có thể tạo tài khoản bằng cách nhấn vào nút 'Đăng ký' ở góc trên bên phải. Điền thông tin email và mật khẩu, sau đó xác nhận email để hoàn tất đăng ký. Quá trình này chỉ mất vài phút."
        },
        {
          question: "Tôi quên mật khẩu, phải làm sao?",
          answer: "Tại trang đăng nhập, nhấn vào 'Quên mật khẩu?'. Nhập email đã đăng ký, chúng tôi sẽ gửi link khôi phục mật khẩu đến email của bạn trong vòng 5 phút. Kiểm tra cả hộp thư spam nếu không thấy email."
        },
        {
          question: "Làm sao để thay đổi thông tin cá nhân?",
          answer: "Vào 'Cài đặt' > 'Hồ sơ cá nhân', bạn có thể cập nhật tên, ảnh đại diện, số điện thoại và các thông tin liên hệ khác. Nhớ nhấn 'Lưu thay đổi' sau khi chỉnh sửa."
        }
      ]
    },
    {
      category: "Thanh toán & Gói dịch vụ",
      items: [
        {
          question: "Các gói dịch vụ có gì khác nhau?",
          answer: "Chúng tôi cung cấp 3 gói:\n• Miễn phí: Tính năng cơ bản, 3 trang web, 1GB dung lượng\n• Pro (299.000đ/tháng): Không giới hạn trang, 10GB dung lượng, tên miền tùy chỉnh\n• Enterprise (999.000đ/tháng): Không giới hạn, hỗ trợ ưu tiên 24/7, API tùy chỉnh"
        },
        {
          question: "Làm thế nào để nâng cấp tài khoản?",
          answer: "Vào 'Cài đặt' > 'Gói dịch vụ', chọn gói phù hợp và nhấn 'Nâng cấp'. Chúng tôi hỗ trợ thanh toán qua thẻ ATM, Visa/MasterCard, MoMo và chuyển khoản. Tài khoản được nâng cấp ngay lập tức sau thanh toán thành công."
        },
        {
          question: "Tôi có thể hủy đăng ký bất cứ lúc nào không?",
          answer: "Có, bạn hoàn toàn có thể hủy đăng ký bất cứ lúc nào trong 'Cài đặt' > 'Gói dịch vụ' > 'Hủy đăng ký'. Gói dịch vụ sẽ vẫn hoạt động đến hết chu kỳ thanh toán hiện tại. Không mất phí hủy."
        },
        {
          question: "Có chính sách hoàn tiền không?",
          answer: "Có, chúng tôi có chính sách hoàn tiền 100% trong vòng 30 ngày đầu tiên nếu bạn không hài lòng với dịch vụ. Liên hệ bộ phận hỗ trợ để được xử lý nhanh chóng."
        }
      ]
    },
    {
      category: "Bảo mật & Dữ liệu",
      items: [
        {
          question: "Dữ liệu của tôi có được bảo mật không?",
          answer: "An toàn dữ liệu là ưu tiên hàng đầu của chúng tôi. Chúng tôi sử dụng:\n• Mã hóa SSL/TLS 256-bit\n• Tuân thủ GDPR và các chuẩn bảo mật quốc tế\n• Sao lưu tự động hàng ngày\n• Xác thực hai yếu tố (2FA)\n• Máy chủ đặt tại Việt Nam và Singapore"
        },
        {
          question: "Tôi có thể xuất dữ liệu của mình không?",
          answer: "Có, bạn có thể xuất toàn bộ dữ liệu của mình dưới dạng JSON, CSV hoặc backup đầy đủ trong 'Cài đặt' > 'Dữ liệu & Quyền riêng tư' > 'Xuất dữ liệu'. File sẽ được gửi đến email của bạn."
        },
        {
          question: "Làm sao để bật xác thực hai yếu tố?",
          answer: "Vào 'Cài đặt' > 'Bảo mật' > 'Xác thực hai yếu tố'. Quét mã QR bằng ứng dụng Google Authenticator hoặc Authy, sau đó nhập mã xác nhận. Chúng tôi khuyến nghị bật tính năng này để tăng cường bảo mật."
        }
      ]
    },
    {
      category: "Tính năng & Sử dụng",
      items: [
        {
          question: "Làm thế nào để tạo trang web mới?",
          answer: "Vào Dashboard, nhấn nút 'Tạo trang mới' ở góc trên. Chọn template có sẵn hoặc bắt đầu từ trang trắng. Sử dụng trình soạn thảo kéo-thả để tùy chỉnh theo ý muốn, sau đó nhấn 'Xuất bản'."
        },
        {
          question: "Tôi có thể sử dụng tên miền riêng không?",
          answer: "Có, với gói Pro trở lên, bạn có thể kết nối tên miền riêng. Vào 'Cài đặt trang web' > 'Tên miền', nhập tên miền và làm theo hướng dẫn cấu hình DNS. Quá trình này thường mất 24-48 giờ để hoàn tất."
        },
        {
          question: "Làm sao để tối ưu SEO cho trang web?",
          answer: "Vào 'Cài đặt trang' > 'SEO', bạn có thể tùy chỉnh:\n• Tiêu đề và mô tả meta\n• Từ khóa\n• Open Graph tags cho mạng xã hội\n• Sitemap tự động\n• Tốc độ trang được tối ưu sẵn"
        },
        {
          question: "Trang web có tương thích với mobile không?",
          answer: "Có, tất cả trang web được tạo trên nền tảng của chúng tôi đều tự động responsive, hiển thị tốt trên mọi thiết bị từ desktop, tablet đến smartphone. Bạn có thể xem trước trên nhiều kích thước màn hình."
        }
      ]
    }
  ];
  const supportChannels = [
    {
      icon: Mail,
      title: "Email",
      description: "Gửi email cho chúng tôi",
      contact: "support@webbuilder.vn",
      link: "mailto:support@webbuilder.vn",
      responseTime: "Trả lời trong 24h"
    },
    {
      icon: Phone,
      title: "Hotline",
      description: "Gọi điện trực tiếp",
      contact: "1900 2468",
      link: "tel:19002468",
      responseTime: "T2-T6: 8h-18h"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat trực tiếp với tư vấn viên",
      contact: "Khả dụng 24/7",
      link: "#",
      responseTime: "Phản hồi ngay lập tức"
    }
  ];
  const guides = [
    {
      title: "Hướng dẫn bắt đầu",
      description: "Tìm hiểu cách sử dụng cơ bản từ A-Z",
      link: "/docs/getting-started",
      duration: "5 phút đọc"
    },
    {
      title: "Video hướng dẫn",
      description: "Xem các video hướng dẫn chi tiết",
      link: "/docs/videos",
      duration: "15+ videos"
    },
    {
      title: "Template & Ví dụ",
      description: "Khám phá thư viện template có sẵn",
      link: "/templates",
      duration: "100+ mẫu"
    },
    {
      title: "Tài liệu API",
      description: "Dành cho developers nâng cao",
      link: "/docs/api",
      duration: "Tài liệu đầy đủ"
    },
    {
      title: "Blog & Tutorials",
      description: "Mẹo, thủ thuật và cập nhật mới",
      link: "/blog",
      duration: "Cập nhật hàng tuần"
    },
    {
      title: "Cộng đồng",
      description: "Tham gia diễn đàn thảo luận",
      link: "/community",
      duration: "5000+ thành viên"
    }
  ];
  const filteredFAQs = faqs.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) => searchQuery === "" || item.question.toLowerCase().includes(searchQuery.toLowerCase()) || item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter((category) => category.items.length > 0);
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full overflow-hidden px-4 py-24 sm:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 -z-10 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-[10%] left-[50%] h-[40%] w-[60%] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -bottom-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl flex-col items-center justify-center gap-8", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "flex flex-col items-center space-y-2",
          initial: "hidden",
          animate: "visible",
          variants: fadeInUp,
          transition: { duration: 0.6 },
          children: [
            /* @__PURE__ */ jsxs(
              Badge,
              {
                variant: "outline",
                className: "mb-4 rounded-full border-primary/20 bg-primary/5 px-4 py-1 text-sm font-medium",
                children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "mr-1 h-3.5 w-3.5 animate-pulse text-primary" }),
                  "Trợ Giúp & Hỗ Trợ"
                ]
              }
            ),
            /* @__PURE__ */ jsx("h1", { className: "bg-gradient-to-b from-foreground to-foreground/30 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl", children: "Trung Tâm Trợ Giúp & Hỗ Trợ" }),
            /* @__PURE__ */ jsx(
              "p",
              {
                className: "max-w-2xl pt-2 text-lg\n                    text-muted-foreground",
                children: "Chúng tôi luôn sẵn sàng hỗ trợ bạn. Tìm câu trả lời nhanh chóng cho câu hỏi của bạn hoặc liên hệ trực tiếp với đội ngũ hỗ trợ chuyên nghiệp của chúng tôi."
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, amount: 0.3 },
          variants: fadeInUp,
          transition: { duration: 0.5 },
          className: "w-full max-w-2xl",
          children: /* @__PURE__ */ jsx(Card, { className: "bg-secondary/20 shadow-md", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "text",
                placeholder: "Tìm kiếm câu hỏi, ví dụ: 'quên mật khẩu', 'nâng cấp tài khoản'...",
                className: "h-12 bg-background pl-10 pr-4 text-base",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value)
              }
            )
          ] }) }) })
        }
      ),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, amount: 0.3 },
          variants: fadeInUp,
          transition: { duration: 0.5, delay: 0.1 },
          className: "w-full",
          children: /* @__PURE__ */ jsxs(Tabs, { defaultValue: "faq", className: "w-full", children: [
            /* @__PURE__ */ jsxs(TabsList, { className: "mx-auto grid w-full max-w-md grid-cols-3 bg-muted/30", children: [
              /* @__PURE__ */ jsx(
                TabsTrigger,
                {
                  value: "faq",
                  className: "rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  children: "FAQ"
                }
              ),
              /* @__PURE__ */ jsx(
                TabsTrigger,
                {
                  value: "contact",
                  className: "rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  children: "Liên hệ"
                }
              ),
              /* @__PURE__ */ jsx(
                TabsTrigger,
                {
                  value: "guides",
                  className: "rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  children: "Hướng dẫn"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              TabsContent,
              {
                value: "faq",
                className: "mt-8 flex w-full flex-col items-center space-y-6",
                children: filteredFAQs.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "w-full max-w-4xl mx-auto", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-12 text-center", children: [
                  /* @__PURE__ */ jsx(HelpCircle, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }),
                  /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Không tìm thấy câu hỏi phù hợp. Thử tìm kiếm từ khóa khác hoặc liên hệ hỗ trợ." })
                ] }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-6 w-full max-w-4xl mx-auto", children: filteredFAQs.map((category, categoryIndex) => /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    initial: "hidden",
                    whileInView: "visible",
                    viewport: { once: true, amount: 0.2 },
                    variants: staggerContainer,
                    children: [
                      /* @__PURE__ */ jsxs(
                        motion.h3,
                        {
                          className: "text-xl font-semibold mb-4 flex items-center gap-2 text-left",
                          variants: fadeInUp,
                          children: [
                            /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 text-primary" }),
                            category.category
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: category.items.map((item, itemIndex) => {
                        const globalIndex = categoryIndex * 100 + itemIndex;
                        const isExpanded = expandedFAQ === globalIndex;
                        return /* @__PURE__ */ jsx(motion.div, { variants: fadeInUp, children: /* @__PURE__ */ jsxs(
                          Card,
                          {
                            className: "cursor-pointer hover:shadow-md transition-shadow",
                            onClick: () => setExpandedFAQ(
                              isExpanded ? null : globalIndex
                            ),
                            children: [
                              /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base font-semibold flex items-start justify-between gap-4", children: [
                                /* @__PURE__ */ jsx("span", { className: "flex-1", children: item.question }),
                                isExpanded ? /* @__PURE__ */ jsx(ChevronDown, { className: "w-5 h-5 text-primary flex-shrink-0 mt-0.5" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" })
                              ] }) }),
                              isExpanded && /* @__PURE__ */ jsx(CardContent, { className: "pt-0", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed whitespace-pre-line", children: item.answer }) })
                            ]
                          }
                        ) }, itemIndex);
                      }) })
                    ]
                  },
                  categoryIndex
                )) })
              }
            ),
            /* @__PURE__ */ jsxs(
              TabsContent,
              {
                value: "contact",
                className: "mt-8 flex w-full flex-col items-center space-y-6",
                children: [
                  /* @__PURE__ */ jsxs(
                    motion.div,
                    {
                      className: "mb-6 text-center",
                      initial: "hidden",
                      whileInView: "visible",
                      viewport: { once: true },
                      variants: fadeInUp,
                      transition: { duration: 0.5 },
                      children: [
                        /* @__PURE__ */ jsx("h2", { className: "mb-2 text-2xl font-bold", children: "Liên Hệ Hỗ Trợ" }),
                        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Chọn phương thức liên hệ phù hợp với bạn" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      className: "mb-8 grid w-full max-w-6xl gap-6 md:grid-cols-3",
                      initial: "hidden",
                      whileInView: "visible",
                      viewport: { once: true, amount: 0.2 },
                      variants: staggerContainer,
                      children: supportChannels.map((channel, index) => /* @__PURE__ */ jsx(motion.div, { variants: fadeInUp, children: /* @__PURE__ */ jsx(
                        Card,
                        {
                          className: "group h-full cursor-pointer bg-secondary/20 transition-all duration-300 hover:border-primary hover:shadow-lg",
                          onClick: () => window.location.href = channel.link,
                          children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center", children: [
                            /* @__PURE__ */ jsx("div", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20", children: /* @__PURE__ */ jsx(channel.icon, { className: "h-6 w-6 text-primary" }) }),
                            /* @__PURE__ */ jsx("h3", { className: "mb-2 text-xl font-semibold", children: channel.title }),
                            /* @__PURE__ */ jsx("p", { className: "mb-3 text-sm text-muted-foreground", children: channel.description }),
                            /* @__PURE__ */ jsx("p", { className: "mb-2 font-medium text-primary", children: channel.contact }),
                            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: channel.responseTime })
                          ] }) })
                        }
                      ) }, index))
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      initial: "hidden",
                      whileInView: "visible",
                      viewport: { once: true, amount: 0.3 },
                      variants: fadeInUp,
                      transition: { duration: 0.5 },
                      className: "w-full max-w-2xl",
                      children: /* @__PURE__ */ jsxs(Card, { className: "bg-secondary/20 shadow-md", children: [
                        /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
                          /* @__PURE__ */ jsx("div", { className: "mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10", children: /* @__PURE__ */ jsx(Clock, { className: "h-6 w-6 text-primary" }) }),
                          /* @__PURE__ */ jsx(CardTitle, { children: "Giờ Làm Việc" }),
                          /* @__PURE__ */ jsx(CardDescription, { children: "Thời gian hoạt động của bộ phận hỗ trợ khách hàng" })
                        ] }),
                        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b", children: [
                            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Thứ Hai - Thứ Sáu:" }),
                            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "8:00 - 18:00" })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b", children: [
                            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Thứ Bảy:" }),
                            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "8:00 - 12:00" })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b", children: [
                            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Chủ Nhật & Ngày Lễ:" }),
                            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Đóng cửa" })
                          ] }),
                          /* @__PURE__ */ jsx("div", { className: "pt-4 bg-primary/5 rounded-lg p-4 mt-4", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-center", children: [
                            /* @__PURE__ */ jsx("strong", { className: "text-primary", children: "Lưu ý:" }),
                            " Live Chat hoạt động 24/7. Email được trả lời trong vòng 24 giờ làm việc. Hotline chỉ hoạt động trong giờ hành chính."
                          ] }) })
                        ] }) })
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      initial: "hidden",
                      whileInView: "visible",
                      viewport: { once: true, amount: 0.3 },
                      variants: fadeInUp,
                      transition: { duration: 0.5, delay: 0.1 },
                      className: "w-full max-w-2xl",
                      children: /* @__PURE__ */ jsxs(Card, { className: "bg-secondary/20 shadow-md", children: [
                        /* @__PURE__ */ jsxs(CardHeader, { children: [
                          /* @__PURE__ */ jsx(CardTitle, { children: "Gửi Tin Nhắn Nhanh" }),
                          /* @__PURE__ */ jsx(CardDescription, { children: "Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại sớm nhất" })
                        ] }),
                        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { className: "space-y-4", children: [
                          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
                            /* @__PURE__ */ jsx(
                              Input,
                              {
                                placeholder: "Họ và tên",
                                className: "bg-background"
                              }
                            ),
                            /* @__PURE__ */ jsx(
                              Input,
                              {
                                type: "email",
                                placeholder: "Email",
                                className: "bg-background"
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsx(Input, { placeholder: "Chủ đề", className: "bg-background" }),
                          /* @__PURE__ */ jsx(
                            "textarea",
                            {
                              className: "min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                              placeholder: "Nội dung tin nhắn..."
                            }
                          ),
                          /* @__PURE__ */ jsxs(Button, { className: "w-full", size: "lg", children: [
                            /* @__PURE__ */ jsx(Send, { className: "mr-2 h-4 w-4" }),
                            "Gửi Tin Nhắn"
                          ] })
                        ] }) })
                      ] })
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              TabsContent,
              {
                value: "guides",
                className: "mt-8 flex w-full flex-col items-center space-y-6",
                children: [
                  /* @__PURE__ */ jsxs(
                    motion.div,
                    {
                      className: "mb-6 text-center",
                      initial: "hidden",
                      whileInView: "visible",
                      viewport: { once: true },
                      variants: fadeInUp,
                      transition: { duration: 0.5 },
                      children: [
                        /* @__PURE__ */ jsx("h2", { className: "mb-2 text-2xl font-bold", children: "Hướng Dẫn Sử Dụng" }),
                        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Tài liệu và hướng dẫn chi tiết để bạn sử dụng hiệu quả" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      className: "grid w-full max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3",
                      initial: "hidden",
                      whileInView: "visible",
                      viewport: { once: true, amount: 0.2 },
                      variants: staggerContainer,
                      children: guides.map((guide, index) => /* @__PURE__ */ jsx(motion.div, { variants: fadeInUp, children: /* @__PURE__ */ jsx(
                        Card,
                        {
                          className: "group h-full cursor-pointer bg-secondary/20 transition-all duration-300 hover:border-primary hover:shadow-lg",
                          onClick: () => window.location.href = guide.link,
                          children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
                            /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-start justify-between", children: [
                              /* @__PURE__ */ jsx(BookOpen, { className: "h-6 w-6 text-primary" }),
                              /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" })
                            ] }),
                            /* @__PURE__ */ jsx("h3", { className: "mb-2 text-lg font-semibold", children: guide.title }),
                            /* @__PURE__ */ jsx("p", { className: "mb-3 text-sm text-muted-foreground", children: guide.description }),
                            /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-primary", children: guide.duration })
                          ] })
                        }
                      ) }, index))
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      initial: "hidden",
                      whileInView: "visible",
                      viewport: { once: true, amount: 0.3 },
                      variants: fadeInUp,
                      transition: { duration: 0.5 },
                      className: "w-full max-w-4xl",
                      children: /* @__PURE__ */ jsxs(Card, { className: "bg-secondary/20 shadow-md", children: [
                        /* @__PURE__ */ jsxs(CardHeader, { children: [
                          /* @__PURE__ */ jsx(CardTitle, { children: "Tài Nguyên Bổ Sung" }),
                          /* @__PURE__ */ jsx(CardDescription, { children: "Các nguồn học tập và hỗ trợ khác" })
                        ] }),
                        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(
                          motion.div,
                          {
                            className: "grid gap-4 md:grid-cols-2",
                            variants: staggerContainer,
                            initial: "hidden",
                            whileInView: "visible",
                            viewport: { once: true },
                            children: [
                              /* @__PURE__ */ jsxs(
                                motion.div,
                                {
                                  className: "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                                  variants: fadeInUp,
                                  children: [
                                    /* @__PURE__ */ jsx(BookOpen, { className: "mt-0.5 h-5 w-5 text-primary" }),
                                    /* @__PURE__ */ jsxs("div", { children: [
                                      /* @__PURE__ */ jsx("h4", { className: "mb-1 font-semibold", children: "Changelog" }),
                                      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Xem các tính năng mới và cập nhật" })
                                    ] })
                                  ]
                                }
                              ),
                              /* @__PURE__ */ jsxs(
                                motion.div,
                                {
                                  className: "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                                  variants: fadeInUp,
                                  children: [
                                    /* @__PURE__ */ jsx(MessageCircle, { className: "mt-0.5 h-5 w-5 text-primary" }),
                                    /* @__PURE__ */ jsxs("div", { children: [
                                      /* @__PURE__ */ jsx("h4", { className: "mb-1 font-semibold", children: "Diễn đàn cộng đồng" }),
                                      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Kết nối với người dùng khác" })
                                    ] })
                                  ]
                                }
                              ),
                              /* @__PURE__ */ jsxs(
                                motion.div,
                                {
                                  className: "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                                  variants: fadeInUp,
                                  children: [
                                    /* @__PURE__ */ jsx(Mail, { className: "mt-0.5 h-5 w-5 text-primary" }),
                                    /* @__PURE__ */ jsxs("div", { children: [
                                      /* @__PURE__ */ jsx("h4", { className: "mb-1 font-semibold", children: "Newsletter" }),
                                      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Đăng ký nhận tin tức hàng tuần" })
                                    ] })
                                  ]
                                }
                              ),
                              /* @__PURE__ */ jsxs(
                                motion.div,
                                {
                                  className: "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                                  variants: fadeInUp,
                                  children: [
                                    /* @__PURE__ */ jsx(HelpCircle, { className: "mt-0.5 h-5 w-5 text-primary" }),
                                    /* @__PURE__ */ jsxs("div", { children: [
                                      /* @__PURE__ */ jsx("h4", { className: "mb-1 font-semibold", children: "Status Page" }),
                                      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Kiểm tra tình trạng hệ thống" })
                                    ] })
                                  ]
                                }
                              )
                            ]
                          }
                        ) })
                      ] })
                    }
                  )
                ]
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, amount: 0.3 },
          variants: fadeInUp,
          transition: { duration: 0.6 },
          className: "w-full max-w-4xl",
          children: /* @__PURE__ */ jsx(Card, { className: "border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-12 text-center", children: [
            /* @__PURE__ */ jsx(HelpCircle, { className: "mx-auto mb-4 h-12 w-12 text-primary" }),
            /* @__PURE__ */ jsx("h3", { className: "mb-3 text-2xl font-bold", children: "Vẫn Chưa Tìm Thấy Câu Trả Lời?" }),
            /* @__PURE__ */ jsx("p", { className: "mx-auto mb-6 max-w-md text-muted-foreground", children: "Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn với bất kỳ câu hỏi nào" }),
            /* @__PURE__ */ jsxs(Button, { size: "lg", className: "gap-2", children: [
              /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5" }),
              "Liên Hệ Với Chúng Tôi"
            ] })
          ] }) })
        }
      )
    ] })
  ] });
}
const SplitComponent = HelpAndSupport;
export {
  SplitComponent as component
};
