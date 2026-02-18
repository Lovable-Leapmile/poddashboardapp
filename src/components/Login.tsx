import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Lock, Smartphone } from 'lucide-react';
import ThemedLogo from '@/components/ThemedLogo';
import { cn } from '@/lib/utils';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { generateOTP, validateOTP, login } = useAuth();
  const { skin } = useTheme();
  
  const isFlipkart = skin === "FLIPKART_UI";
  const gradientBg = isFlipkart 
    ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700" 
    : "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600";
  const accentColor = isFlipkart ? "text-blue-600" : "text-yellow-600";
  const accentHover = isFlipkart ? "hover:text-blue-700" : "hover:text-yellow-700";
  const buttonBg = isFlipkart ? "bg-blue-500 hover:bg-blue-600" : "bg-yellow-500 hover:bg-yellow-600";
  const buttonText = isFlipkart ? "text-white" : "text-white";
  const focusBorder = isFlipkart ? "focus:border-blue-500 focus:ring-blue-500" : "focus:border-yellow-500 focus:ring-yellow-500";
  const logoBg = isFlipkart ? "bg-blue-500" : "bg-[#fddc4e]";

  const handleRequestOTP = async () => {
    if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      return;
    }

    setIsLoading(true);
    const success = await generateOTP(mobile);
    if (success) {
      setShowOtpField(true);
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    if (!otp || !/^\d{4,6}$/.test(otp)) {
      return;
    }

    setIsLoading(true);
    const result = await validateOTP(mobile, otp);
    
    if (result.success && result.data) {
      const userData = result.data.records[0];
      login(result.data.access_token, userData);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Welcome Section */}
      <div className={cn(
        "hidden lg:flex lg:w-1/2 flex-col justify-center items-center text-white p-12",
        gradientBg
      )}>
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-48 mx-auto flex items-center justify-center mb-6 p-4 bg-white/10 rounded-lg">
              <ThemedLogo className="w-full h-auto object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {isFlipkart ? "Welcome to Flipkart" : "Welcome to QikPod"}
          </h1>
          <p className={cn("text-xl", isFlipkart ? "text-blue-100" : "text-yellow-100")}>
            {isFlipkart ? "Your Smart Locker Management System" : "Your Smart Locker Management System"}
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md flex-1 flex items-center justify-center">
          {/* Mobile/Tablet Logo */}
          <div className="w-full">
            <div className="lg:hidden text-center mb-8">
              <div className={cn("w-36 h-24 mx-auto rounded-lg flex items-center justify-center mb-4 shadow-md p-3", logoBg)}>
                <ThemedLogo className="w-full h-full object-contain" />
              </div>
            </div>

            <Card className="shadow-lg border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">Login</CardTitle>
                <CardDescription className="text-gray-600">
                  Enter your credentials to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter mobile number"
                      value={mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setMobile(value);
                      }}
                      maxLength={10}
                      className={cn("pl-10 h-12 text-center text-lg border-gray-300", focusBorder)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {!showOtpField ? (
                  <Button
                    onClick={handleRequestOTP}
                    disabled={!mobile || mobile.length < 10 || isLoading}
                    className={cn("w-full h-12 font-medium", buttonBg, buttonText)}
                  >
                    {isLoading ? 'Sending OTP...' : 'Request OTP'}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                        Enter OTP
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setOtp(value);
                          }}
                          className={cn("pl-10 h-12 text-center text-lg tracking-widest border-gray-300", focusBorder)}
                          maxLength={6}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                      <Button
                        onClick={handleLogin}
                        disabled={!otp || otp.length < 4 || isLoading}
                        className={cn("w-full h-12 font-medium", buttonBg, buttonText)}
                      >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </Button>

                    <Button
                      onClick={() => {
                        setShowOtpField(false);
                        setOtp('');
                      }}
                      variant="outline"
                      className="w-full h-10 border-gray-300 text-gray-600 hover:bg-gray-50"
                      disabled={isLoading}
                    >
                      Back to Mobile Number
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 All Rights Reserved | Leapmile Logistics Pvt.Ltd</p>
          <a 
            href="https://leapmile.com/terms-and-privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn("mt-1 inline-block hover:underline", accentColor, accentHover)}
          >
            Terms and Condition & Privacy Policy / Cookies Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;