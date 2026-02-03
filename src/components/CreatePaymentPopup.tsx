import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign, Hash, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApiUrl } from "@/hooks/useApiUrl";
import { toast } from "sonner";

interface CreatePaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentResponse {
  status: string;
  status_code: number;
  message: string;
  timestamp: string;
  count: number;
  rowcount: number;
  records: Array<{
    id: number;
    status: string;
    created_at: string;
    updated_at: string;
    payment_reference_id: string;
    payment_mode: string;
    payment_type: string | null;
    payment_amount: string;
    payment_status: string;
    payment_url: string;
    payment_vendor: string;
    payment_client_awbno: string;
    payment_paid_id: string | null;
    user_credits: string | null;
    user_id: string | null;
    payment_client_reference_id: string;
  }>;
  statusbool: boolean;
  ok: boolean;
  api_processing_time: number;
}

const CreatePaymentPopup: React.FC<CreatePaymentPopupProps> = ({ isOpen, onClose, onSuccess }) => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const [formData, setFormData] = useState({
    clientReferenceId: "",
    awbNo: "",
    amount: "",
    paymentMethod: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.clientReferenceId &&
      formData.awbNo &&
      formData.amount &&
      formData.paymentMethod &&
      parseFloat(formData.amount) > 0
    );
  };

  const createPayment = async (): Promise<string | null> => {
    try {
      const response = await fetch(
        `${apiUrl.payments}/payments/create_payment/?payment_client_awbno=${encodeURIComponent(formData.awbNo)}&amount=${encodeURIComponent(formData.amount)}&payment_client_reference_id=${encodeURIComponent(formData.clientReferenceId)}&payment_vendor=${encodeURIComponent(formData.paymentMethod)}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaymentResponse = await response.json();
      console.log("Payment API Response:", data);

      if (data.records && data.records.length > 0 && data.records[0].payment_url) {
        return data.records[0].payment_url;
      } else {
        console.error("Payment response missing payment_url:", data);
        throw new Error("No payment URL received from the server");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create payment. Please try again.");
      throw error;
    }
  };

  const handlePayNow = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);

    try {
      const paymentUrl = await createPayment();

      if (paymentUrl) {
        toast.success("Payment request created successfully! Redirecting to payment gateway...");
        // Navigate directly to the payment URL
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error("Error in payment flow:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientReferenceId: "",
      awbNo: "",
      amount: "",
      paymentMethod: "",
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Create New Payment
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Fill in the details below to create a new payment request</p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="clientReferenceId" className="text-sm font-medium flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              Client Reference ID
            </Label>
            <Input
              id="clientReferenceId"
              placeholder="Enter Client Reference ID"
              value={formData.clientReferenceId}
              onChange={(e) => handleInputChange("clientReferenceId", e.target.value)}
              className="bg-background border-border focus:border-primary transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="awbNo" className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              AWB No
            </Label>
            <Input
              id="awbNo"
              placeholder="Enter AWB No"
              value={formData.awbNo}
              onChange={(e) => handleInputChange("awbNo", e.target.value)}
              className="bg-background border-border focus:border-primary transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter Amount"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className="bg-background border-border focus:border-primary transition-colors"
              disabled={isSubmitting}
            />
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <p className="text-xs text-muted-foreground">
                Amount: ₹{parseFloat(formData.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Method
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => handleInputChange("paymentMethod", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="bg-background border-border focus:border-primary">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paytm">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://pwebassets.paytm.com/commonwebassets/paytmweb/footer/images/paytmLogo.svg"
                      alt="Paytm"
                      className="w-4 h-4 object-contain"
                    />
                    Paytm
                  </div>
                </SelectItem>
                <SelectItem value="razorpay">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://app.qikpod.com/assets/assets/images/1545306239_rzp-glyph-positive_1.png"
                      alt="Razorpay"
                      className="w-4 h-4 object-contain"
                    />
                    Razorpay
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="hover:scale-105 transition-transform"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayNow}
              disabled={!isFormValid() || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePaymentPopup;
