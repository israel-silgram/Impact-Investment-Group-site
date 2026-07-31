import { FileCheck2, KeyRound, Search, ShieldCheck, Users } from "lucide-react";
import type { ProcessStep } from "@/components/ui/process-rail";

/** The delivery chain shown in the approved hero mockup. */
export const deliverySteps: ProcessStep[] = [
  {
    id: "source",
    icon: Search,
    title: "Source Property",
    description: "Find quality properties in high-demand areas.",
  },
  {
    id: "verify",
    icon: ShieldCheck,
    title: "Verify Property",
    description: "Complete due diligence and property checks.",
  },
  {
    id: "lease",
    icon: FileCheck2,
    title: "Secure Leases",
    description: "Secure leases with trusted partners.",
  },
  {
    id: "deliver",
    icon: KeyRound,
    title: "Deliver Homes",
    description: "Deliver safe decent home standards.",
  },
  {
    id: "support",
    icon: Users,
    title: "Support Provided",
    description: "Provide care or support that change lives.",
  },
];
