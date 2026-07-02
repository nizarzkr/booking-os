import { Center } from "@mantine/core";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Center mih="100dvh" p="md">
      {children}
    </Center>
  );
}
