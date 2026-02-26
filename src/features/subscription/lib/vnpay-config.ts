// VNPay Configuration
export const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || "",
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || "",
  vnp_Url: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: process.env.VNPAY_API || "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || `${process.env.NEXT_PUBLIC_BASE_URL}api/vnpay/return`,
};

export default vnpayConfig;
