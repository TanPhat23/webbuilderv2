import crypto from "crypto";
import querystring from "qs";
import moment from "moment";

/**
 * Sort object keys for VNPay signature
 */
export function sortObject(obj: Record<string, any>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const str: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }

  str.sort();

  for (let i = 0; i < str.length; i++) {
    const key = str[i];
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }

  return sorted;
}

/**
 * Create VNPay payment URL
 */
export function createPaymentUrl(params: {
  amount: number;
  orderId: string;
  orderInfo: string;
  ipAddr: string;
  returnUrl: string;
  tmnCode: string;
  hashSecret: string;
  vnpUrl: string;
  bankCode?: string;
  locale?: string;
}): string {
  const {
    amount,
    orderId,
    orderInfo,
    ipAddr,
    returnUrl,
    tmnCode,
    hashSecret,
    vnpUrl,
    bankCode,
    locale = "vn",
  } = params;

  const createDate = moment().format("YYYYMMDDHHmmss");
  const expireDate = moment().add(15, "minutes").format("YYYYMMDDHHmmss");
  const currCode = "VND";

  let vnp_Params: Record<string, any> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: currCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "billpayment",
    vnp_Amount: amount * 100, // VNPay amount is in VND cents
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl =
    vnpUrl + "?" + querystring.stringify(vnp_Params, { encode: false });

  return paymentUrl;
}

/**
 * Verify VNPay return signature
 */
export function verifyReturnUrl(
  params: Record<string, any>,
  hashSecret: string,
): boolean {
  const vnp_Params = { ...params };
  const secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  const sorted = sortObject(vnp_Params);
  const signData = querystring.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac("sha512", hashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return secureHash === signed;
}

/**
 * Convert USD to VND (approximate rate, you should use real-time rate)
 */
export function convertUSDtoVND(usd: number): number {
  const exchangeRate = 24000; // Approximate rate, should be updated from API
  return Math.round(usd * exchangeRate);
}
