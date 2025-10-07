import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeveloperCard } from "@/components/onboarding/developer-card";
import { team } from "@/constants/team";
import { NextIntlClientProvider } from "next-intl";
import type { DeveloperCardProps } from "@/types/types";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";

vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: ({ src, alt }: { src: string; alt?: string }) => <img src={src} alt={alt || ""} />,
  };
});

function renderWithLocale(props: DeveloperCardProps, messages: typeof en, locale: string) {
  return render(
    <NextIntlClientProvider messages={messages} locale={locale}>
      <DeveloperCard {...props} />
    </NextIntlClientProvider>
  );
}

describe("DeveloperCard component", () => {
  it("renders correctly with English locale", () => {
    const member = team[0];

    renderWithLocale({ member }, en, "en");

    expect(screen.getByText(en["Main"]["about-us"]["names"]["alexandr"])).toBeInTheDocument();
    expect(screen.getByText(en["Main"]["about-us"]["roles"]["teamLead"])).toBeInTheDocument();
    expect(
      screen.getByText(en["Main"]["about-us"]["descriptions"]["alexandr"])
    ).toBeInTheDocument();
  });

  it("renders correctly with Russian locale", () => {
    const member = team[1];

    renderWithLocale({ member }, ru, "ru");

    expect(screen.getByText(ru["Main"]["about-us"]["names"]["anna"])).toBeInTheDocument();
    expect(screen.getByText(ru["Main"]["about-us"]["roles"]["developer"])).toBeInTheDocument();
    expect(screen.getByText(ru["Main"]["about-us"]["descriptions"]["anna"])).toBeInTheDocument();
  });

  it("renders avatar image with correct alt text", () => {
    const member = team[2];

    renderWithLocale({ member }, en, "en");

    const avatar = screen.getByAltText(member.name) as HTMLImageElement;
    expect(avatar).toBeInTheDocument();

    expect(avatar.src).toContain(member.avatar.src || "");
  });
});
