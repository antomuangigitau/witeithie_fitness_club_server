export const processPayment = async (req: Request, res: Response) => {
const { amount, phoneNumber } = req.body;
try {
    await fetch("https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MPESA_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            BusinessShortCode: process.env.MPESA_SHORT_CODE,
            Password: Buffer.from(
                `${process.env.MPESA_SHORT_CODE}${process.env.MPESA_PASSKEY}${Math.floor(Date.now() / 1000)}`,
            ).toString("base64"),
            Timestamp: Math.floor(Date.now() / 1000).toString(),
            TransactionType: "CustomerPayBillOnline",
}