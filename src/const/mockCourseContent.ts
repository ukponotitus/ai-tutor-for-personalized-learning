export const courseContentData: Record<
  string,
  {
    modules: {
      id: number;
      title: string;
      lessons: {
        id: number;
        title: string;
        type: "text" | "video";
        content: string;
        duration: number;
      }[];
    }[];
    resources: {
      id: number;
      title: string;
      type: "PDF" | "Link" | "Document" | "Video";
      url: string;
      size?: string;
      description?: string;
    }[];
  }
> = {
  "basic-computer-networking": {
    modules: [
      {
        id: 1,
        title: "Networking Fundamentals",
        lessons: [
          {
            id: 1,
            title: "What is Networking?",
            type: "text",
            content:
              "Introduction to networking concepts, history, and importance in modern communication.",
            duration: 15,
          },
          {
            id: 2,
            title: "TCP/IP and OSI Model",
            type: "video",
            content: "https://youtu.be/networking-basics",
            duration: 20,
          },
        ],
      },
      {
        id: 2,
        title: "Network Devices & Topologies",
        lessons: [
          {
            id: 3,
            title: "Routers, Switches, and Hubs",
            type: "text",
            content:
              "Understanding different networking devices and their functions in a network.",
            duration: 18,
          },
          {
            id: 4,
            title: "Common Network Topologies",
            type: "video",
            content: "https://youtu.be/network-topologies",
            duration: 16,
          },
        ],
      },
      {
        id: 3,
        title: "IP Addressing & Troubleshooting",
        lessons: [
          {
            id: 5,
            title: "IPv4 vs IPv6",
            type: "text",
            content: "Differences between IPv4 and IPv6 addressing schemes.",
            duration: 14,
          },
          {
            id: 6,
            title: "Basic Troubleshooting Commands",
            type: "text",
            content: "Using ping, traceroute, and ipconfig for diagnostics.",
            duration: 12,
          },
        ],
      },
    ],
    resources: [
      { id: 1, title: "Networking Basics PDF", type: "PDF", url: "#", size: "2 MB" },
      { id: 2, title: "OSI Model Diagram", type: "PDF", url: "#", description: "Reference image of OSI layers" },
    ],
  },

  "basic-hardware-maintenance": {
    modules: [
      {
        id: 1,
        title: "Hardware Components Overview",
        lessons: [
          {
            id: 1,
            title: "Motherboards & CPUs",
            type: "text",
            content: "Detailed look into motherboard layouts and processor types.",
            duration: 15,
          },
          {
            id: 2,
            title: "RAM & Storage Devices",
            type: "video",
            content: "https://youtu.be/hardware-overview",
            duration: 20,
          },
        ],
      },
      {
        id: 2,
        title: "Assembly & Installation",
        lessons: [
          {
            id: 3,
            title: "Building a PC Step-by-Step",
            type: "text",
            content: "How to assemble components into a functioning computer.",
            duration: 25,
          },
        ],
      },
      {
        id: 3,
        title: "Troubleshooting & Maintenance",
        lessons: [
          {
            id: 4,
            title: "Common Hardware Problems",
            type: "text",
            content: "Identifying and resolving frequent hardware issues.",
            duration: 18,
          },
        ],
      },
    ],
    resources: [
      { id: 1, title: "PC Assembly Guide", type: "PDF", url: "#", size: "3 MB" },
      { id: 2, title: "Troubleshooting Flowchart", type: "Document", url: "#", description: "Step-by-step guide" },
    ],
  },

  "management-information-system": {
    modules: [
      {
        id: 1,
        title: "Introduction to MIS",
        lessons: [
          {
            id: 1,
            title: "What is MIS?",
            type: "text",
            content: "Understanding the role of MIS in organizations.",
            duration: 12,
          },
          {
            id: 2,
            title: "MIS vs Other Information Systems",
            type: "video",
            content: "https://youtu.be/mis-intro",
            duration: 14,
          },
        ],
      },
      {
        id: 2,
        title: "System Analysis & Design",
        lessons: [
          {
            id: 3,
            title: "Analyzing Business Needs",
            type: "text",
            content: "How to identify business requirements for systems.",
            duration: 20,
          },
        ],
      },
      {
        id: 3,
        title: "MIS in Decision Making",
        lessons: [
          {
            id: 4,
            title: "Data-Driven Decisions",
            type: "text",
            content: "Using MIS tools to support decision-making processes.",
            duration: 18,
          },
        ],
      },
    ],
    resources: [
      { id: 1, title: "MIS Overview Document", type: "Document", url: "#", size: "1.5 MB" },
    ],
  },

  "web-technology": {
    modules: [
      {
        id: 1,
        title: "HTML Basics",
        lessons: [
          {
            id: 1,
            title: "HTML Structure",
            type: "text",
            content: "Understanding tags, elements, and attributes.",
            duration: 20,
          },
        ],
      },
      {
        id: 2,
        title: "CSS & Styling",
        lessons: [
          {
            id: 2,
            title: "Selectors & Properties",
            type: "video",
            content: "https://youtu.be/css-selectors",
            duration: 18,
          },
        ],
      },
      {
        id: 3,
        title: "JavaScript Fundamentals",
        lessons: [
          {
            id: 3,
            title: "Variables & Functions",
            type: "text",
            content: "Getting started with JavaScript programming.",
            duration: 22,
          },
        ],
      },
    ],
    resources: [
      { id: 1, title: "HTML & CSS Reference", type: "PDF", url: "#", size: "2 MB" },
    ],
  },

  "file-organization-and-management": {
    modules: [
      {
        id: 1,
        title: "File Systems Basics",
        lessons: [
          {
            id: 1,
            title: "Types of File Systems",
            type: "text",
            content: "Understanding FAT, NTFS, ext4, and more.",
            duration: 18,
          },
        ],
      },
      {
        id: 2,
        title: "Data Organization Methods",
        lessons: [
          {
            id: 2,
            title: "Sequential vs Indexed Files",
            type: "text",
            content: "Pros and cons of each method.",
            duration: 20,
          },
        ],
      },
      {
        id: 3,
        title: "File Management in OS",
        lessons: [
          {
            id: 3,
            title: "File Permissions & Access",
            type: "text",
            content: "Understanding security and sharing in file systems.",
            duration: 15,
          },
        ],
      },
    ],
    resources: [
      { id: 1, title: "File Management PDF", type: "PDF", url: "#", size: "2 MB" },
    ],
  },

  "communication-in-english": {
    modules: [
      {
        id: 1,
        title: "Grammar Essentials",
        lessons: [
          {
            id: 1,
            title: "Sentence Structure",
            type: "text",
            content: "Learn sentence construction and grammar rules.",
            duration: 15,
          },
        ],
      },
      {
        id: 2,
        title: "Vocabulary Building",
        lessons: [
          {
            id: 2,
            title: "Common Professional Words",
            type: "video",
            content: "https://youtu.be/vocab-builder",
            duration: 12,
          },
        ],
      },
      {
        id: 3,
        title: "Presentation Skills",
        lessons: [
          {
            id: 3,
            title: "Speaking with Confidence",
            type: "text",
            content: "Tips and exercises for public speaking.",
            duration: 18,
          },
        ],
      },
    ],
    resources: [
      { id: 1, title: "English Communication Guide", type: "PDF", url: "#", size: "1.8 MB" },
    ],
  },
};
