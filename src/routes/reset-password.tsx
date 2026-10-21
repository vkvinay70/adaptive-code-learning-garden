import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GetStartedAuthPage } from "./login";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Get Started — NaomiLearn Python & AI Academy" },
      {
        name: "description",
        content: "NaomiLearn uses Google Sign-In for passwordless student authentication.",
      },
    ],
  }),
  component: ResetPasswordRedirectPage,
});

function ResetPasswordRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: "/login", replace: true });
  }, [navigate]);

  return <GetStartedAuthPage />;
}
