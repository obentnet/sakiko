import { BiLogoGoLang, BiLogoPostgresql } from "react-icons/bi";
import { DiRedis } from "react-icons/di";
import {
  FaAws,
  FaCloudflare,
  FaDocker,
  FaNodeJs,
  FaNpm,
  FaPhp,
  FaPython,
  FaReact,
  FaUbuntu,
} from "react-icons/fa";
import { FaDebian, FaRust, FaWindows } from "react-icons/fa6";
import { IoLogoFirebase, IoLogoVercel, IoLogoVue } from "react-icons/io5";
import { RiJavaLine, RiNextjsFill, RiSupabaseFill } from "react-icons/ri";
import {
  SiBun,
  SiExpo,
  SiFastapi,
  SiGnubash,
  SiHono,
  SiJavascript,
  SiLinuxmint,
  SiLua,
  SiMongodb,
  SiMysql,
  SiNuxt,
  SiPnpm,
  SiPrisma,
  SiSqlite,
  SiSwift,
  SiTypescript,
  SiVitest,
} from "react-icons/si";
import { TbBrandCpp } from "react-icons/tb";

export type SkillPreference = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
};

export type SkillCategory = {
  title: string;
  items: SkillPreference[];
};

export const skillCategories: SkillCategory[] = [
  {
    title: "Languages",
    items: [
      {
        name: "Python",
        icon: FaPython,
        iconBg: "#f7e37a",
        iconColor: "#346fa2",
      },
      {
        name: "TypeScript",
        icon: SiTypescript,
        iconBg: "#dcecff",
        iconColor: "#3178c6",
      },
      {
        name: "JavaScript",
        icon: SiJavascript,
        iconBg: "#f7df1e",
        iconColor: "#333",
      },
      {
        name: "Go",
        icon: BiLogoGoLang,
        iconBg: "#00add8",
        iconColor: "#ffffff",
      },
      {
        name: "Java",
        icon: RiJavaLine,
        iconBg: "#007396",
        iconColor: "#ffffff",
      },
      {
        name: "C++",
        icon: TbBrandCpp,
        iconBg: "#00599c",
        iconColor: "#ffffff",
      },
      {
        name: "Swift",
        icon: SiSwift,
        iconBg: "#f05138",
        iconColor: "#ffffff",
      },
      {
        name: "Rust",
        icon: FaRust,
        iconBg: "#000000",
        iconColor: "#ffffff",
      },
      {
        name: "PHP",
        icon: FaPhp,
        iconBg: "#4f5b93",
        iconColor: "#ffffff",
      },
      {
        name: "Lua",
        icon: SiLua,
        iconBg: "#000080",
        iconColor: "#ffffff",
      },
      {
        name: "Bash",
        icon: SiGnubash,
        iconBg: "#f0f0f0",
        iconColor: "#333333",
      },
      {
        name: "Node.js",
        icon: FaNodeJs,
        iconBg: "#68a063",
        iconColor: "#ffffff",
      },
    ],
  },
  {
    title: "Frameworks & Libraries",
    items: [
      {
        name: "React",
        icon: FaReact,
        iconBg: "#61dafb",
        iconColor: "#20232a",
      },
      {
        name: "Next.js",
        icon: RiNextjsFill,
        iconBg: "#000000",
        iconColor: "#ffffff",
      },
      {
        name: "Vue.js",
        icon: IoLogoVue,
        iconBg: "#4fc08d",
        iconColor: "#ffffff",
      },
      {
        name: "Nuxt.js",
        icon: SiNuxt,
        iconBg: "#00c58e",
        iconColor: "#ffffff",
      },
      {
        name: "Expo",
        icon: SiExpo,
        iconBg: "#000020",
        iconColor: "#ffffff",
      },
      {
        name: "Hono",
        icon: SiHono,
        iconBg: "#0f172a",
        iconColor: "#ffffff",
      },
      {
        name: "Bun",
        icon: SiBun,
        iconBg: "#ffcc33",
        iconColor: "#000000",
      },
      {
        name: "FastAPI",
        icon: SiFastapi,
        iconBg: "#009688",
        iconColor: "#ffffff",
      },
      {
        name: "Node.js",
        icon: FaNodeJs,
        iconBg: "#68a063",
        iconColor: "#ffffff",
      },
    ],
  },
  {
    title: "Tools & DevOps",
    items: [
      {
        name: "Cloudflare",
        icon: FaCloudflare,
        iconBg: "#f38020",
        iconColor: "#ffffff",
      },
      {
        name: "Firebase",
        icon: IoLogoFirebase,
        iconBg: "#ffcb2b",
        iconColor: "#ffffff",
      },
      {
        name: "Vercel",
        icon: IoLogoVercel,
        iconBg: "#000000",
        iconColor: "#ffffff",
      },
      {
        name: "AWS",
        icon: FaAws,
        iconBg: "#ff9900",
        iconColor: "#000000",
      },
      {
        name: "Docker",
        icon: FaDocker,
        iconBg: "#2496ed",
        iconColor: "#ffffff",
      },
      {
        name: "Vitest",
        icon: SiVitest,
        iconBg: "#ffcc33",
        iconColor: "#000000",
      },
      {
        name: "pnpm",
        icon: SiPnpm,
        iconBg: "#f69220",
        iconColor: "#ffffff",
      },
      {
        name: "NPM",
        icon: FaNpm,
        iconBg: "#cb3837",
        iconColor: "#ffffff",
      },
    ],
  },
  {
    title: "Databases",
    items: [
      {
        name: "PostgreSQL",
        icon: BiLogoPostgresql,
        iconBg: "#336791",
        iconColor: "#ffffff",
      },
      {
        name: "MySQL",
        icon: SiMysql,
        iconBg: "#4f5b93",
        iconColor: "#ffffff",
      },
      {
        name: "Supabase",
        icon: RiSupabaseFill,
        iconBg: "#3fcf8e",
        iconColor: "#ffffff",
      },
      {
        name: "MongoDB",
        icon: SiMongodb,
        iconBg: "#47a248",
        iconColor: "#ffffff",
      },
      {
        name: "SQLite",
        icon: SiSqlite,
        iconBg: "#003b5c",
        iconColor: "#ffffff",
      },
      {
        name: "Prisma",
        icon: SiPrisma,
        iconBg: "#2d2d2d",
        iconColor: "#ffffff",
      },
      {
        name: "Redis",
        icon: DiRedis,
        iconBg: "#d82c20",
        iconColor: "#ffffff",
      },
    ],
  },
  {
    title: "OS & Environment",
    items: [
      {
        name: "Ubuntu",
        icon: FaUbuntu,
        iconBg: "#e95420",
        iconColor: "#ffffff",
      },
      {
        name: "Debian",
        icon: FaDebian,
        iconBg: "#a70000",
        iconColor: "#ffffff",
      },
      {
        name: "Linux Mint",
        icon: SiLinuxmint,
        iconBg: "#6495ED",
        iconColor: "#ffffff",
      },
      {
        name: "Windows",
        icon: FaWindows,
        iconBg: "#0078d4",
        iconColor: "#ffffff",
      },
    ],
  },
];
