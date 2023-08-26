import { DryRunResult } from "./DryRunResult";
import { Form, Field, ErrorMessage, useFormikContext } from "formik";
import { Values } from "../types";
import { ChangeEvent } from "react";
import { NewUserGuide } from "./NewUserGuide";
import { useLinkContract, useUI } from "../hooks";
import { pickDecoded, pickDecodedError, pickError } from "useink/utils";
import { useWallet } from "useink";
import { Button } from "./Button";

export const UrlShortenerForm = () => {
  const { isSubmitting, isValid, values, setFieldTouched, handleChange } =
    useFormikContext<Values>();
  const { shortenDryRun, link } = useLinkContract();
  const { account } = useWallet();
  const { setShowConnectWallet } = useUI();
  const decoded = pickDecoded(shortenDryRun?.result);
  const runtimeError = pickError(shortenDryRun?.result);
  const handleInputChange = (e: ChangeEvent, name: string) => {
    shortenDryRun?.resetState();
    setFieldTouched(name);
    handleChange(e);
  };
  return (
    <Form>
      <div className="group">
        <Field
          type="text"
          name="url"
          disabled={isSubmitting}
          placeholder="Paste a URL"
          onChange={(e: ChangeEvent) => handleInputChange(e, "url")}
        />
        <ErrorMessage name="url" component="div" className="error-message" />
      </div>

      <div className="group">
        <Field
          type="text"
          name="alias"
          disabled={isSubmitting}
          onChange={(e: ChangeEvent) => handleInputChange(e, "alias")}
        />
        <ErrorMessage name="alias" component="div" className="error-message" />
      </div>

      <div className="group">
        {isValid && values.url && <DryRunResult values={values} />}
      </div>

      <div className="group">
        {account ? (
          <Button
            type="submit"
            disabled={isSubmitting || decoded !== "Shortened" || !isValid}
          >
            Shorten
          </Button>
        ) : (
          <Button type="button" onClick={() => setShowConnectWallet(true)}>
            Connect Wallet
          </Button>
        )}
      </div>

      {runtimeError && link && (
        <div className="text-xs text-left mb-2 text-red-500">
          {pickDecodedError(
            shortenDryRun,
            link,
            {
              ContractTrapped: "Unable to complete transaction.",
              StorageDepositLimitExhausted:
                "Not enough funds in the selected account.",
              StorageDepositNotEnoughFunds:
                "Not enough funds in the selected account.",
            },
            "Something went wrong."
          )}
        </div>
      )}

      <div className="group">
        <NewUserGuide />
      </div>
    </Form>
  );
};
