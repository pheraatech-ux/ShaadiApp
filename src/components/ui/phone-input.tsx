"use client";

import dynamic from "next/dynamic";
import type IntlTelInputComponent from "intl-tel-input/reactWithUtils";
import "intl-tel-input/dist/css/intlTelInput.css";

const IntlTelInput = dynamic(
  () =>
    // @ts-expect-error -- TS can't resolve the deep path but webpack can
    (import("intl-tel-input/react/dist/IntlTelInputWithUtils") as Promise<{
      default: typeof IntlTelInputComponent;
    }>),
  {
    ssr: false,
    loading: () => (
      <div className="h-12 animate-pulse rounded-xl bg-muted/50" />
    ),
  }
);

type PhoneInputProps = {
  value?: string;
  onChangeNumber: (number: string) => void;
  onChangeValidity?: (valid: boolean) => void;
};

export function PhoneInput({
  value,
  onChangeNumber,
  onChangeValidity,
}: PhoneInputProps) {
  return (
    <div className="iti-full-width">
      <IntlTelInput
        value={value}
        onChangeNumber={onChangeNumber}
        onChangeValidity={onChangeValidity}
        initialCountry="in"
        separateDialCode={true}
        formatAsYouType={true}
        inputProps={{
          className:
            "h-12 w-full min-w-0 rounded-xl border border-input bg-muted/50 px-4 text-[15px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-ring focus:bg-background focus:ring-3 focus:ring-ring/50",
          placeholder: "98765 43210",
        }}
      />
    </div>
  );
}
