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

const testLabels: Record<TestKey, string> = {
  buzzer: "Buzzer",
  doors: "Doors",
  bay_door: "Bay Door",
  ups: "UPS",
  network_speed: "Network Speed",
};

const CertifyPodPopup: React.FC<CertifyPodPopupProps> = ({ open, onClose, podId }) => {
  const [status, setStatus] = useState<TestStatus>({
    buzzer: "idle",
    doors: "idle",
    bay_door: "idle",
    ups: "idle",
    network_speed: "idle",
  });
  const [running, setRunning] = useState<TestKey | null>(null);

  const handleTest = async (key: TestKey) => {
    setRunning(key);
    // Simulate test — replace with real API calls as needed
    await new Promise((r) => setTimeout(r, 1200));
    setStatus((prev) => ({ ...prev, [key]: "success" }));
    setRunning(null);
  };

  const allPassed = (Object.keys(testLabels) as TestKey[]).every(
    (k) => status[k] === "success"
  );

  const handleCertify = () => {
    onClose();
    setStatus({
      buzzer: "idle",
      doors: "idle",
      bay_door: "idle",
      ups: "idle",
      network_speed: "idle",
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setStatus({
        buzzer: "idle",
        doors: "idle",
        bay_door: "idle",
        ups: "idle",
        network_speed: "idle",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Certify Pod — {podId}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          {(Object.keys(testLabels) as TestKey[]).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between border border-border rounded-lg px-4 py-3"
            >
              <Button
                variant="outline"
                disabled={status[key] === "success" || running !== null}
                onClick={() => handleTest(key)}
                className={cn(
                  "min-w-[140px]",
                  status[key] === "success" && "opacity-60"
                )}
              >
                {running === key ? "Testing..." : testLabels[key]}
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
