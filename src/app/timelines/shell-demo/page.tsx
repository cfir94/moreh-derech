import type { Metadata } from "next";
import { ShellDemo } from "./ShellDemo";

export const metadata: Metadata = { robots: { index: false } };

export default function LearningAidShellDemoPage() {
  return <ShellDemo />;
}
