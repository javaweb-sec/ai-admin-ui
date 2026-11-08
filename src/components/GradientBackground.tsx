import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

const GradientBackground = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();

  const darkGradientConfig = {
    backgroundColor: "hsl(230 25% 5%)",
    gradients: [
      "rgba(38, 80, 110, 0.035), rgba(38, 80, 110, 0)" /* 绿色 */,
      "rgba(38, 80, 110, 0.035), rgba(38, 80, 110, 0)" /* 深绿色 */,
      "rgba(38, 80, 110, 0.035), rgba(38, 80, 110, 0)" /* 亮绿色 */,
      "rgba(38, 80, 110, 0.035), rgba(38, 80, 110, 0)" /* 翠绿色 */,
      "rgba(38, 80, 110, 0.035), rgba(38, 80, 110, 0)" /* 深翠绿色 */,
    ],
  };

  const lightGradientConfig = {
    backgroundColor: "#ffffff",
    gradients: [
      "rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0)",
      "rgba(0, 0, 0, 0.008), rgba(0, 0, 0, 0)",
      "rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0)",
      "rgba(0, 0, 0, 0.006), rgba(0, 0, 0, 0)",
      "rgba(0, 0, 0, 0.008), rgba(0, 0, 0, 0)",
    ],
  };

  const gradientConfig =
    resolvedTheme === "light" ? lightGradientConfig : darkGradientConfig;

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* 固定的渐变背景层 - 不会随内容变化 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundColor: gradientConfig.backgroundColor,
          backgroundImage: gradientConfig.gradients
            .map((gradient) => `radial-gradient(closest-side, ${gradient})`)
            .join(", "),
          backgroundSize: `
            130vmax 130vmax,
            80vmax 80vmax,
            90vmax 90vmax,
            110vmax 110vmax,
            90vmax 90vmax
          `,
          backgroundPosition: `
            -80vmax -80vmax,
            60vmax -30vmax,
            10vmax 10vmax,
            -30vmax -10vmax,
            50vmax 50vmax
          `,
          backgroundRepeat: "no-repeat",
          animation: "gradientMovement 10s linear infinite",
          zIndex: 0,
        }}
      />
      {/* 轻微模糊层 - 可选，降低模糊强度 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          zIndex: 1,
        }}
      />
      {/* 内容层 */}
      <div className="relative h-full w-full" style={{ zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;
