import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import GeneralInfo from "@/components/onboarding/general-info";
import { NextIntlClientProvider } from "next-intl";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";
import { team } from "@/constants/team";

vi.mock("next/image", () => {
  return {
    __esModule: true,
    default: ({ src, alt }: { src: string; alt?: string }) => <img src={src} alt={alt || ""} />,
  };
});

describe("GeneralInfo component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderWithLocale(messages: typeof en, locale: string) {
    return render(
      <NextIntlClientProvider messages={messages} locale={locale}>
        <GeneralInfo />
      </NextIntlClientProvider>
    );
  }

  it("renders correctly with English locale", () => {
    renderWithLocale(en, "en");

    expect(screen.queryByText(en["Main"]["about-project"]["title"])).toBeInTheDocument();
    expect(screen.queryByText(en["Main"]["about-us"]["title"])).toBeInTheDocument();

    vi.advanceTimersByTime(50);

    expect(screen.getByText(en["Main"]["about-project"]["title"])).toBeInTheDocument();
    expect(screen.getByText(en["Main"]["about-project"]["description"])).toBeInTheDocument();
    expect(screen.getByText(en["Main"]["about-us"]["title"])).toBeInTheDocument();
    expect(screen.getByText(en["Main"]["about-us"]["description"])).toBeInTheDocument();

    team.forEach((member) => {
      const namesObj = en["Main"]["about-us"]["names"];
      const nameKey = (member.name.split(".").pop() || "alexandr") as keyof typeof namesObj;
      expect(screen.getAllByText(namesObj[nameKey])[0]).toBeInTheDocument();
    });
  });

  it("renders correctly with Russian locale", () => {
    renderWithLocale(ru, "ru");

    vi.advanceTimersByTime(50);

    expect(screen.getByText(ru["Main"]["about-project"]["title"])).toBeInTheDocument();
    expect(screen.getByText(ru["Main"]["about-project"]["description"])).toBeInTheDocument();
    expect(screen.getByText(ru["Main"]["about-us"]["title"])).toBeInTheDocument();
    expect(screen.getByText(ru["Main"]["about-us"]["description"])).toBeInTheDocument();

    team.forEach((member) => {
      const namesObj = ru["Main"]["about-us"]["names"];
      const nameKey = (member.name.split(".").pop() || "alexandr") as keyof typeof namesObj;
      const nameText = namesObj[nameKey];
      expect(screen.getAllByText(nameText)[0]).toBeInTheDocument();
    });
  });

  it("DeveloperCards render avatars correctly", () => {
    renderWithLocale(en, "en");

    vi.advanceTimersByTime(50);

    team.forEach((member) => {
      const avatar = screen.getAllByAltText(member.name)[0] as HTMLImageElement;
      expect(avatar).toBeInTheDocument();
      expect(avatar.src).toContain(member.avatar.src || "");
    });
  });
});
