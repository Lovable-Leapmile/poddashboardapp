import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Bell, DoorOpen, Warehouse, Zap, Globe, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

const testConfig: Record<TestKey, { label: string; icon: React.ElementType; iconColor: string; bgColor: string }> = {
  buzzer: { label: "Buzzer", icon: Bell, iconColor: "text-amber-500", bgColor: "bg-amber-100" },
  doors: { label: "Doors", icon: DoorOpen, iconColor: "text-green-600", bgColor: "bg-green-100" },
  bay_door: { label: "Bay Door", icon: Warehouse, iconColor: "text-amber-600", bgColor: "bg-amber-50" },
  ups: { label: "UPS", icon: Zap, iconColor: "text-amber-500", bgColor: "bg-amber-100" },
  network_speed: { label: "Network Speed", icon: Globe, iconColor: "text-amber-500", bgColor: "bg-amber-100" },
};

const testKeys: TestKey[] = ["buzzer", "doors", "bay_door", "ups", "network_speed"];

const initialStatus: TestStatus = {
  buzzer: "idle",
  doors: "idle",
  bay_door: "idle",
  ups: "idle",
  network_speed: "idle",
};

const PUBSUB_BASE = "https://rakeshlocalhost.leapmile.com/pubsub";
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 20;

const TEST_ACTIONS: Record<TestKey, string> = {
  buzzer: "buzzer_test",
  doors: "door_test",
  bay_door: "bay_door_test",
  ups: "ups_test",
  network_speed: "network_test",
};

const TEST_ALIASES: Record<TestKey, string[]> = {
  buzzer: ["buzzer", "buzzer_test"],
  doors: ["door", "doors", "door_test", "doors_test"],
  bay_door: ["bay_door", "baydoor", "bay_door_test", "bay door"],
  ups: ["ups", "ups_test"],
  network_speed: ["network", "network_speed", "network_test", "network speed"],
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

interface ParsedTestRecord {
  test: string;
  test_status: string;
  doors_failed?: number;
  signature: string;
}

const parseTestRecord = (record: any): ParsedTestRecord => {
  const rawDoorsFailed = record?.doors_failed ?? record?.Doors_Failed ?? record?.doorsFailed;

  return {
    test: String(record?.Test ?? record?.test ?? record?.action ?? ""),
    test_status: String(record?.Test_Status ?? record?.test_status ?? record?.status ?? ""),
    doors_failed: rawDoorsFailed != null ? Number(rawDoorsFailed) : undefined,
    signature: JSON.stringify(record ?? {}),
  };
};

const isExpectedTestRecord = (key: TestKey, testName: string) => {
  const normalizedTestName = normalize(testName);
  return TEST_ALIASES[key].some((alias) => normalizedTestName.includes(normalize(alias)));
};

const CertifyPodPopup: React.FC<CertifyPodPopupProps> = ({ open, onClose, podId }) => {
  const { accessToken } = useAuth();
  const [status, setStatus] = useState<TestStatus>({ ...initialStatus });
  const [running, setRunning] = useState<TestKey | null>(null);
  const [testResult, setTestResult] = useState<{ test: string; test_status: string; doors_failed?: number } | null>(
    null,
  );

  const fetchSubscribeRecords = async (numRecords = 5): Promise<ParsedTestRecord[]> => {
    const res = await fetch(`${PUBSUB_BASE}/subscribe?topic=${encodeURIComponent(podId)}&num_records=${numRecords}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error("Unable to fetch test records");
    }

    const data = await res.json();
    const records = Array.isArray(data) ? data : [data];
    return records.filter(Boolean).map(parseTestRecord);
  };

  const runTestFlow = async ({
    key,
    label,
    publishInfo,
    completedInfo,
    includeDoorsFailed,
  }: {
    key: TestKey;
    label: string;
    publishInfo?: { message: string; duration?: number };
    completedInfo?: { message: string; duration?: number };
    includeDoorsFailed?: boolean;
  }) => {
    const action = TEST_ACTIONS[key];

    const baselineRecords = await fetchSubscribeRecords(5);
    const baselineSignature =
      baselineRecords.find((record) => isExpectedTestRecord(key, record.test))?.signature ?? null;

    const publishRes = await fetch(`${PUBSUB_BASE}/publish?topic=${encodeURIComponent(podId)}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    if (!publishRes.ok) {
      throw new Error("Unable to publish test action");
    }

    if (publishInfo) {
      toast.info(publishInfo.message, { duration: publishInfo.duration ?? 5000 });
    }

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await sleep(POLL_INTERVAL_MS);

      let records: ParsedTestRecord[] = [];
      try {
        records = await fetchSubscribeRecords(5);
      } catch {
        continue;
      }

      const terminalRecord = records.find((record) => {
        if (!isExpectedTestRecord(key, record.test)) return false;
        if (baselineSignature && record.signature === baselineSignature) return false;

        const normalizedStatus = record.test_status.trim().toLowerCase();
        return normalizedStatus === "completed" || normalizedStatus === "failed";
      });

      if (!terminalRecord) {
        continue;
      }

      const normalizedStatus = terminalRecord.test_status.trim().toLowerCase();

      if (normalizedStatus === "completed") {
        toast.success(`${label}: ${terminalRecord.test_status}`);
        if (completedInfo) {
          toast.info(completedInfo.message, { duration: completedInfo.duration ?? 6000 });
        }

        setTestResult({
          test: terminalRecord.test || action,
          test_status: terminalRecord.test_status,
          ...(includeDoorsFailed ? { doors_failed: terminalRecord.doors_failed } : {}),
        });
        setStatus((prev) => ({ ...prev, [key]: "success" }));
        return;
      }

      toast.error(`${label}: ${terminalRecord.test_status || "Failed"}`);
      setStatus((prev) => ({ ...prev, [key]: "failed" }));
      return;
    }

    toast.error(`${label}: Timed out`);
    setStatus((prev) => ({ ...prev, [key]: "failed" }));
  };

  const handleTest = async (key: TestKey) => {
    if (status[key] === "success" || running !== null) return;

    setRunning(key);
    setTestResult(null);

    try {
      if (key === "buzzer") {
        await runTestFlow({ key, label: "Buzzer" });
      } else if (key === "doors") {
        await runTestFlow({
          key,
          label: "Doors",
          completedInfo: { message: "Please close the opened door.", duration: 6000 },
          includeDoorsFailed: true,
        });
      } else if (key === "bay_door") {
        await runTestFlow({ key, label: "Bay Door" });
      } else if (key === "ups") {
        await runTestFlow({
          key,
          label: "UPS",
          publishInfo: { message: "If the pod is in raw mode, please plug out the power.", duration: 8000 },
        });
      } else if (key === "network_speed") {
        await runTestFlow({ key, label: "Network Speed" });
      }
    } catch {
      toast.error(`${testConfig[key].label} test failed`);
      setStatus((prev) => ({ ...prev, [key]: "failed" }));
    } finally {
      setRunning(null);
    }
  };

  const completedCount = testKeys.filter((k) => status[k] === "success").length;
  const allPassed = completedCount === testKeys.length;
  const progressPercent = (completedCount / testKeys.length) * 100;

  const handleCertify = () => {
    onClose();
    setStatus({ ...initialStatus });
    setTestResult(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setStatus({ ...initialStatus });
      setTestResult(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[95vw] p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div>Certify Pod #{podId}</div>
                <div className="text-sm font-normal text-muted-foreground mt-0.5">
                  Status: {allPassed ? "Certified" : "Pending Certification"}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Progress */}
        <div className="px-6 pb-4">
          <div className="text-sm text-muted-foreground mb-2">
            Progress: {completedCount} / {testKeys.length} Completed
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Test Items */}
        <div className="px-6 flex flex-col gap-3">
          {testKeys.map((key) => {
            const config = testConfig[key];
            const Icon = config.icon;
            const isSuccess = status[key] === "success";
            const isFailed = status[key] === "failed";
            const isRunning = running === key;

            return (
              <div
                key={key}
                onClick={() => handleTest(key)}
                className={cn(
                  "flex items-center justify-between border border-border rounded-xl px-5 py-4 cursor-pointer transition-all",
                  isSuccess
                    ? "bg-primary/10 border-primary/30"
                    : isFailed
                      ? "bg-destructive/10 border-destructive/30"
                      : "hover:bg-muted/50",
                  (isSuccess || (running !== null && !isRunning)) && "pointer-events-none",
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.bgColor)}>
                    <Icon className={cn("h-5 w-5", config.iconColor)} />
                  </div>
                  <span className={cn("text-base font-medium", isSuccess ? "text-foreground" : "text-foreground")}>
                    {isRunning
                      ? `Testing ${config.label}...`
                      : isFailed
                        ? `${config.label} - Failed, try again`
                        : config.label}
                  </span>
                </div>
                <div>
                  {isSuccess ? (
                    <CheckCircle2 className="h-7 w-7 text-green-600" />
                  ) : isFailed ? (
                    <XCircle className="h-7 w-7 text-destructive" />
                  ) : (
                    <span className="h-7 w-7 inline-block rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Test Result Dialog */}
        <Dialog
          open={!!testResult}
          onOpenChange={(o) => {
            if (!o) setTestResult(null);
          }}
        >
          <DialogContent className="sm:max-w-xs w-[80vw] p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Test Result</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 text-sm mt-2">
              <div>
                <span className="font-semibold text-foreground">Test:</span>{" "}
                <span className="text-muted-foreground">{testResult?.test}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Status:</span>{" "}
                <span className="text-muted-foreground">{testResult?.test_status}</span>
              </div>
              {testResult?.doors_failed != null && (
                <div>
                  <span className="font-semibold text-foreground">Doors Failed:</span>{" "}
                  <span className="text-destructive font-medium">{testResult.doors_failed}</span>
                </div>
              )}
            </div>
            <Button variant="outline" className="mt-4 w-full" onClick={() => setTestResult(null)}>
              Close
            </Button>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 px-6 pt-5 pb-6">
          <Button
            disabled={!allPassed}
            onClick={handleCertify}
            className="bg-primary hover:bg-primary/80 text-primary-foreground px-10 py-3 text-base font-semibold rounded-full flex items-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            Complete Certification
          </Button>
          <button
            onClick={() => handleOpenChange(false)}
            className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertifyPodPopup;
