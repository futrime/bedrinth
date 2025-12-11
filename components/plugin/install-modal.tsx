"use client";
import type { GetPackageResponse } from "@/lib/api";

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";

import CodeBlock from "./code-block";

import { Result } from "@/lib/result";
import { Version } from "@/lib/api";
function commandBuilder(
  verInfo: Version,
  pkg: GetPackageResponse,
  version?: string,
): Result<string, string> {
  if (verInfo.packageManager == "lip") {
    if (verInfo.source == "github") {
      // lip--github
      return Result.Ok(
        `lip install ${pkg.identifier}${version ? `@${version}` : ""}`,
      );
    }
  } else if (verInfo.packageManager == "pip") {
    if (verInfo.source == "pypi") {
      // pip--pypi
      return Result.Ok(
        `pip install ${pkg.identifier}${version ? `==${version}` : ""}`,
      );
    } else if (verInfo.source == "github") {
      // pip--github
      return Result.Ok(
        `pip install git+https://${pkg.identifier}${version ? `@${version}` : ""
        }`,
      );
    }
  } else if (verInfo.packageManager == "none") {
    // none--github
    return Result.Err("Download and install manually");
  }

  return Result.Err("");
}

export default function InstallModal({
  pkg,
  versionStr,
  isOpen,
  onOpenChange,
}: {
  pkg: GetPackageResponse;
  versionStr: string;
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const version = pkg?.versions.find((t) => t.version === versionStr);

  const releaseTimeString = new Date(
    version?.releasedAt || "",
  ).toLocaleString();

  const installCmd = commandBuilder(
    version as Version,
    pkg,
    versionStr,
  );

  return (
    <>
      <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange}>
        <ModalContent>
          {(_onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Install {pkg?.name}
              </ModalHeader>
              <ModalBody className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white flex justify-between items-center">
                  <h3 className="text-xl font-bold mb-2">Version</h3>
                  <p className="text-lg">{versionStr}</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg text-white flex justify-between items-center">
                  <h3 className="text-xl font-bold mb-2">Release Time</h3>
                  <p className="text-lg">{releaseTimeString}</p>
                </div>
                <div className="p-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-lg text-white">
                  <h3 className="text-xl font-bold mb-2">Install Command</h3>
                  <CodeBlock code={installCmd.val} />
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
