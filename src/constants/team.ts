import alexandr from "@/assets/alexandr.webp";
import anna from "@/assets/anna.webp";
import vika from "@/assets/vika.webp";

export const team = [
  {
    avatar: alexandr,
    name: "about-us.names.alexandr",
    role: "about-us.roles.teamLead",
    description: "about-us.descriptions.alexandr",
    contributions: [
      "about-us.contributions.requestEditor",
      "about-us.contributions.responsePanel",
      "about-us.contributions.prettifyJson",
      "about-us.contributions.base64Encoding",
      "about-us.contributions.urlMethodSelector",
      "about-us.contributions.headersSection",
      "about-us.contributions.codeGeneration",
      "about-us.contributions.projectPlanning",
    ],
    github: "https://github.com/Belifegor",
  },
  {
    avatar: anna,
    name: "about-us.names.anna",
    role: "about-us.roles.developer",
    description: "about-us.descriptions.anna",
    contributions: [
      "about-us.contributions.variables",
      "about-us.contributions.history",
      "about-us.contributions.analytics",
      "about-us.contributions.langSupport",
      "about-us.contributions.errorUI",
    ],
    github: "https://github.com/ann-sm",
  },
  {
    avatar: vika,
    name: "about-us.names.victoria",
    role: "about-us.roles.developer",
    description: "about-us.descriptions.victoria",
    contributions: [
      "about-us.contributions.mainPage",
      "about-us.contributions.tokenUI",
      "about-us.contributions.authRoutes",
      "about-us.contributions.firebaseAuth",
      "about-us.contributions.signOut",
    ],
    github: "https://github.com/blk-thorn",
  },
];
