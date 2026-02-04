import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Smartphone, Mail, Lock, CreditCard, Banknote, Smartphone as PhoneIcon, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
}

export function PaymentModal({ isOpen, onClose, amount }: PaymentModalProps) {
  const [step, setStep] = useState<'verify' | 'payment' | 'success'>('verify');
  const [otp, setOtp] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const { formatAmount } = useCurrency();

  const handleVerify = () => {
    if (otp.length === 4) {
      setStep('payment');
    }
  };

  const handlePayment = () => {
    if (selectedMethod) {
      setStep('success');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Secure Transaction
          </DialogTitle>
          <DialogDescription>
            {step === 'verify' && "For your security, please verify your identity to proceed."}
            {step === 'payment' && `Select a payment method to fund ${formatAmount(Number(amount))}.`}
            {step === 'success' && "Transaction processed successfully."}
          </DialogDescription>
        </DialogHeader>

        {step === 'verify' && (
          <div className="space-y-6 py-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm h-fit">
                <Lock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-sm text-blue-900">
                <p className="font-bold mb-1">Safety First</p>
                <p>We use 2-Factor Authentication (2FA) to ensure only you can authorize payments.</p>
              </div>
            </div>

            <Tabs defaultValue="sms" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sms">SMS Pin</TabsTrigger>
                <TabsTrigger value="email">Email Code</TabsTrigger>
              </TabsList>
              <TabsContent value="sms" className="space-y-4 pt-4">
                <div className="text-center space-y-2">
                   <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                     <Smartphone className="w-6 h-6 text-muted-foreground" />
                   </div>
                   <p className="text-sm text-muted-foreground">Enter the 4-digit code sent to <strong>+27 82 *** 4932</strong></p>
                </div>
              </TabsContent>
              <TabsContent value="email" className="space-y-4 pt-4">
                <div className="text-center space-y-2">
                   <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                     <Mail className="w-6 h-6 text-muted-foreground" />
                   </div>
                   <p className="text-sm text-muted-foreground">Enter the 4-digit code sent to <strong>user@example.com</strong></p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <Input 
                    key={i}
                    type="text" 
                    maxLength={1}
                    className="w-12 h-12 text-center text-xl font-bold"
                    value={otp[i] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) setOtp(prev => prev + val);
                    }}
                  />
                ))}
              </div>
            </div>
            
            <Button className="w-full" onClick={handleVerify} disabled={otp.length < 4}>Verify & Continue</Button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4 py-4">
             <div className="grid grid-cols-1 gap-3">
                {/* PayFast */}
                <div 
                  className={cn(
                    "border rounded-xl p-4 cursor-pointer transition-all hover:border-primary flex items-center justify-between",
                    selectedMethod === 'payfast' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                  )}
                  onClick={() => setSelectedMethod('payfast')}
                >
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">
                       PayFast
                     </div>
                     <div>
                       <div className="font-bold text-sm">PayFast</div>
                       <div className="text-xs text-muted-foreground">Credit Card, Instant EFT, QR</div>
                     </div>
                   </div>
                   {selectedMethod === 'payfast' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>

                {/* PayU */}
                <div 
                  className={cn(
                    "border rounded-xl p-4 cursor-pointer transition-all hover:border-primary flex items-center justify-between",
                    selectedMethod === 'payu' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                  )}
                  onClick={() => setSelectedMethod('payu')}
                >
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">
                       PayU
                     </div>
                     <div>
                       <div className="font-bold text-sm">PayU EFT Pro</div>
                       <div className="text-xs text-muted-foreground">Secure Internet Banking EFT</div>
                     </div>
                   </div>
                   {selectedMethod === 'payu' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>

                {/* Ozow */}
                <div 
                  className={cn(
                    "border rounded-xl p-4 cursor-pointer transition-all hover:border-primary flex items-center justify-between",
                    selectedMethod === 'ozow' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                  )}
                  onClick={() => setSelectedMethod('ozow')}
                >
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-xs">
                       Ozow
                     </div>
                     <div>
                       <div className="font-bold text-sm">Ozow</div>
                       <div className="text-xs text-muted-foreground">Instant Bank-to-Bank Payments</div>
                     </div>
                   </div>
                   {selectedMethod === 'ozow' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>
             </div>

             <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground flex gap-2">
               <Lock className="w-3 h-3 mt-0.5" />
               All payments are processed securely. Funds are held in escrow until work is delivered.
             </div>

             <Button className="w-full" onClick={handlePayment} disabled={!selectedMethod}>Pay R{amount}</Button>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Payment Successful!</h3>
            <p className="text-muted-foreground">Your funds (R{amount}) have been safely deposited into escrow.</p>
            <Button className="w-full mt-4" onClick={onClose}>Return to Dashboard</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}