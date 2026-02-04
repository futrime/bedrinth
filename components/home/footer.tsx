"use client";

import React from "react";
import { Link } from "@nextui-org/react";

import { BedrinthLogo } from "@/components/icons";

// type SocialIconProps = Omit<IconProps, "icon">;

// const navLinks: {
//   name: string;
//   href: string;
// }[] = [];

// const socialItems: {
//   name: string;
//   href: string;
//   icon: (props: SocialIconProps) => React.JSX.Element;
// }[] = [];

export function FooterComponent() {
  return (
    <footer className="flex w-full flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-row items-between justify-between px-6 py-6 lg:py-12 lg:px-8">
        <div className="flex items-center justify-center">
          <Link href="/">
            <BedrinthLogo height={32} width={32} />
            <span className="text-medium font-medium text-default-500 uppercase">
              &nbsp;&nbsp; Bedrinth
            </span>
          </Link>
        </div>

        {/* <Spacer y={4} />
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              isExternal
              className="text-default-500"
              href={item.href}
              size="sm"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <Spacer y={6} />
        <div className="flex justify-center gap-x-4">
          {socialItems.map((item) => (
            <Link
              key={item.name}
              isExternal
              className="text-default-400"
              href={item.href}
            >
              <span className="sr-only">{item.name}</span>
              <item.icon aria-hidden="true" className="w-5" />
            </Link>
          ))}
        </div>
        <Spacer y={4} /> */}
        <p className="mt-1 text-center text-small text-default-400">
          &copy; 2026 The LeviMC Team
        </p>
      </div>
    </footer>
  );
}
