import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GetStartedAuthPage } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Get Started — NaomiLearn Python & AI Academy" },
      {
        name: "description",
        content: "Continue with Google to create or access your NaomiLearn student account.",
      },
    ],
  }),
  component: SignupRedirectPage,
});

function SignupRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({ to: "/login", replace: true });
  }, [navigate]);

  return <GetStartedAuthPage />;
}
