import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Libs email (Node natif) : les garder externes au bundle serveur pour éviter
  // les erreurs de résolution de leurs `require` dynamiques (imapflow/nodemailer).
  serverExternalPackages: ["nodemailer", "imapflow", "mailparser"],
};

export default nextConfig;
