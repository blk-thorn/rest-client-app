import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";
import WelcomeMessage from "@/components/onboarding/welcome-message";

function renderWithLocale(children: React.ReactNode, messages: typeof en, locale: string) {
  return render(
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}

describe("WelcomeMessage component", () => {
  it("renders correctly for guests in English", () => {
    renderWithLocale(<WelcomeMessage />, en, "en");

    expect(screen.getByText(en.Main.welcome.greetings)).toBeInTheDocument();

    const signInLink = screen.getByRole("link", { name: en.Main.welcome["sign-in"] });
    const signUpLink = screen.getByRole("link", { name: en.Main.welcome["sign-up"] });

    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute("href", "/signin");

    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/signup");
  });

  it("renders correctly for guests in Russian", () => {
    renderWithLocale(<WelcomeMessage />, ru, "ru");

    expect(screen.getByText(ru.Main.welcome.greetings)).toBeInTheDocument();

    const signInLink = screen.getByRole("link", { name: ru.Main.welcome["sign-in"] });
    const signUpLink = screen.getByRole("link", { name: ru.Main.welcome["sign-up"] });

    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute("href", "/signin");

    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/signup");
  });

  it("renders correctly for authenticated users in English", () => {
    renderWithLocale(<WelcomeMessage isAuthenticated username="Alice" />, en, "en");

    expect(screen.getByText(`${en.Main.welcome["greetings-back"]}Alice!`)).toBeInTheDocument();
  });

  it("renders correctly for authenticated users in Russian", () => {
    renderWithLocale(<WelcomeMessage isAuthenticated username="Алиса" />, ru, "ru");

    expect(screen.getByText(`${ru.Main.welcome["greetings-back"]}Алиса!`)).toBeInTheDocument();
  });
});
