export interface SubmitConstructionPassphraseOptions {
  passphrase: string;
  rememberMe?: boolean;
  endpoint?: string;
  redirect?: string;
}

export async function submitConstructionPassphrase(
  options: SubmitConstructionPassphraseOptions,
): Promise<{ success: boolean; error?: string }> {
  const {
    passphrase,
    rememberMe = true,
    endpoint = "/api/construction-guest",
    redirect = "/",
  } = options;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passphrase,
        rememberMe,
        redirect,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      success?: boolean;
      error?: string;
    };

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Invalid passphrase",
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "An unexpected error occurred.",
    };
  }
}
