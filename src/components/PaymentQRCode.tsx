import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign } from "lucide-react";

interface PaymentQRCodeProps {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  orderCode: string;
}

const PaymentQRCode = ({ bankName, accountNumber, accountName, amount, orderCode }: PaymentQRCodeProps) => {
  // Generate VietQR URL - use VietQR bank code
  const normalizedBank = bankName.trim().toLowerCase().replace(/\s+/g, "");
  const bankCodeMap: Record<string, string> = {
    mb: "mbbank",
    mbank: "mbbank",
    mbbank: "mbbank",
  };
  const bankCode = bankCodeMap[normalizedBank] ?? normalizedBank;
  const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(orderCode)}&accountName=${encodeURIComponent(accountName)}`;

  if (!accountNumber) {
    return (
      <Alert>
        <AlertDescription>
          Chưa cấu hình thông tin ngân hàng. Vui lòng liên hệ admin.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <DollarSign className="h-5 w-5" />
          Thông tin thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <img
            src={qrUrl}
            alt="QR Code thanh toán"
            className="w-64 h-64 rounded-lg shadow-lg"
          />
        </div>
        
        <div className="space-y-2 p-4 bg-background/50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ngân hàng:</span>
            <span className="font-semibold">{bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Số tài khoản:</span>
            <span className="font-mono font-semibold">{accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Chủ tài khoản:</span>
            <span className="font-semibold">{accountName}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">Số tiền:</span>
            <span className="font-bold text-primary text-lg">
              {amount.toLocaleString('vi-VN')} đ
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nội dung:</span>
            <span className="font-mono font-semibold">{orderCode}</span>
          </div>
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            Vui lòng quét mã QR hoặc chuyển khoản với nội dung chính xác để đơn hàng được xử lý tự động.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PaymentQRCode;
