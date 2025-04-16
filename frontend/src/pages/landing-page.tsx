import { motion } from "motion/react";
import {
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavBody,
  NavItems,
} from "@/components/ui/resizable-navbar";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { IconPlayerPlay } from "@tabler/icons-react";
import { StarsBackground } from "@/components/ui/starts-background";
import { Cover } from "@/components/ui/cover";
import { Link } from "react-router";
import { adminPrefix } from "@/lib/config";
import { ShootingStars } from "@/components/ui/shooting-stars";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-900 relative w-full">
      <ShootingStars />
      <StarsBackground />
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <div className="flex items-center gap-4">
            <NavbarButton href={`${adminPrefix}/apps`} variant="secondary">
              工作台
            </NavbarButton>
          </div>
        </NavBody>
      </Navbar>

      <div className="h-48"></div>

      <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
        轻松管理分发安卓应用 <br /> @ <Cover>🚀 APKraft</Cover>
      </h1>
      <motion.p
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.3,
          delay: 0.8,
        }}
        className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
      >
        轻量 · 安全 · 自托管 支持版本管理、更新检测、下载引导与完整性校验。
      </motion.p>

      <div className="flex justify-center">
        <Link to={`${adminPrefix}/apps`}>
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 px-8"
          >
            <IconPlayerPlay></IconPlayerPlay>
            <span>开始</span>
          </HoverBorderGradient>
        </Link>
      </div>
    </div>
  );
}
