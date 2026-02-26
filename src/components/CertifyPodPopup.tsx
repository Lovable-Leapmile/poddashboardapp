import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface CertifyPodPopupProps {
  open: boolean;
  onClose: () => void;
  podId: string;
}

type TestKey = "buzzer" | "doors" | "bay_door" | "ups" | "network_speed";

interface TestStatus {
  buzzer: "idle" | "success" | "failed";
  doors: "idle" | "success" | "failed";
  bay_door: "idle" | "success" | "failed";
  ups: "idle" | "success" | "failed";
  network_speed: "idle" | "success" | "failed";
}

const testConfig: Record<TestKey, { label: string; color: string }> = {
  buzzer: { label: "Buzzer", color: "bg-blue-500 hover:bg-blue-600 text-white" },
  doors: { label: "Doors", color: "bg-orange-500 hover:bg-orange-600 text-white" },
  bay_door: { label: "Bay Door", color: "bg-purple-500 hover:bg-purple-600 text-white" },
  ups: { label: "UPS", color: "bg-teal-500 hover:bg-teal-600 text-white" },
  network_speed: { label: "Network Speed", color: "bg-indigo-500 hover:bg-indigo-600 text-white" },
};

const initialStatus: TestStatus = {
  buzzer: "idle",
  doors: "idle",
  bay_door: "idle",
  ups: "idle",
  network_speed: "idle",
};

const CertifyPodPopup: React.FC<CertifyPodPopupProps> = ({ open, onClose, podId }) => {
  const [status, setStatus] = useState<TestStatus>({ ...initialStatus });
  const [running, setRunning] = useState<TestKey | null>(null);

  const handleTest = async (key: TestKey) => {
    setRunning(key);
    await new Promise((r) => setTimeout(r, 1200));
    setStatus((prev) => ({ ...prev, [key]: "success" }));
    setRunning(null);
  };

  const allPassed = (Object.keys(testConfig) as TestKey[]).every(
    (k) => status[k] === "success"
  );

  const handleCertify = () => {
    onClose();
    setStatus({ ...initialStatus });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setStatus({ ...initialStatus });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Certify Pod — {podId}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          {(Object.keys(testConfig) as TestKey[]).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between border border-border rounded-lg px-4 py-3"
            >
              <Button
                disabled={status[key] === "success" || running !== null}
                onClick={() => handleTest(key)}
                className={cn(
                  "min-w-[160px] font-semibold",
                  status[key] === "success" ? "opacity-50 bg-muted text-muted-foreground" : testConfig[key].color
                )}
              >
                {running === key ? "Testing..." : testConfig[key].label}
              </Button>
              <div className="ml-4">
                {status[key] === "success" && (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                )}
                {status[key] === "failed" && (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                {status[key] === "idle" && (
                  <span className="h-6 w-6 inline-block rounded-full border-2 border-muted-foreground/30" />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <Button
            disabled={!allPassed}
            onClick={handleCertify}
            className="bg-[#FDDC4E] hover:bg-yellow-400 text-black px-8 py-2 text-base font-semibold"
          >
            Certify
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertifyPodPopup;
