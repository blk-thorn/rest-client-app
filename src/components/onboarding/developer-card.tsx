"use rest";

import React from "react";
import { Card, CardContent } from "@/lib/ui/card";
import { Label } from "@/lib/ui/label";
import { Button } from "@/lib/ui/button";
import Link from "next/link";
import { FC } from "react";
import { DeveloperCardProps } from "@/types/types";
import Image from "next/image";
import { useTranslations } from "next-intl";

export const DeveloperCard: FC<DeveloperCardProps> = ({ member }) => {
  const t = useTranslations("Main");

  return (
    <Card className="h-130 p-4 flex flex-col items-center gap-4 bg-gray-900 shadow-lg rounded-2xl transition-transform hover:scale-105 overflow-auto">
      <Image
        width={300}
        height={300}
        src={member.avatar.src}
        alt={member.name}
        className="w-24 h-24 rounded-full object-cover border-2 border-gray-50/80"
      />

      <CardContent className="flex flex-col items-center gap-2 p-0 w-full h-full">
        <div className="flex flex-col items-center text-center">
          <Label className="text-xl font-semibold text-white">{t(member.name)}</Label>
          <p className="text-md text-green-400/60 font-medium mb-2">{t(member.role)}</p>
          <p className="text-sm text-gray-300">{t(member.description)}</p>
        </div>

        <ul className="list-disc list-inside mt-2 text-sm text-gray-400 text-left flex-grow w-full">
          {member.contributions.map((item, idx) => (
            <li key={idx}>{t(item)}</li>
          ))}
        </ul>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="mt-2 w-full bg-slate-700 hover:bg-slate-800 text-white border-none"
        >
          <Link href={member.github} target="_blank">
            GitHub
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
