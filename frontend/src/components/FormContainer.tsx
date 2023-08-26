import linkLogo from "../link-logo.svg";
import { Formik } from "formik";
import { initialValues, UrlShortenerSchema } from "../const";
import { useLinkContract, useSubmitHandler, useUI } from "../hooks";
import { UrlShortenerForm } from "./Form";
import { Header } from "./Header";
import { SubmitResult } from "./SubmitResult";
import { ConnectWallet, Loader } from ".";
import { hasAny } from "useink/utils";
import ItemContainer from "./ItemContainer";

export const FormContainer = () => {
  const submitFn = useSubmitHandler();
  const { showConnectWallet, setShowConnectWallet } = useUI();
  const { shorten } = useLinkContract();

  return (
    <div className="App">
      <ConnectWallet
        show={showConnectWallet}
        onClose={() => setShowConnectWallet(false)}
      />
      <Formik
        initialValues={initialValues}
        validationSchema={UrlShortenerSchema}
        onSubmit={(values, helpers) => {
          if (!helpers) return;
          submitFn(values, helpers);
        }}
      >
        {({
          status: { finalized, events, slug, errorMessage } = {},
          isSubmitting,
        }) => {
          return isSubmitting &&
            shorten &&
            !hasAny(shorten, "PendingSignature", "None") ? (
            <Loader message="Submitting transaction..." />
          ) : (
            <>
              <Header />
              <div className="content h-[70%]">
                <div className="form-panel">
                  <img
                    src={linkLogo}
                    className="link-logo h-16 rounded-xl"
                    alt="logo"
                  />{" "}
                  {finalized ? (
                    <SubmitResult
                      events={events}
                      slug={slug}
                      errorMessage={errorMessage}
                    />
                  ) : (
                    <UrlShortenerForm />
                  )}
                </div>
              </div>
              <footer className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ItemContainer
                    imageSrc="https://public.bnbstatic.com/static/academy/uploads-original/ee705c26cee74f3b962238e36ef563be.png"
                    name="Polkadot"
                    description="Polkadot revolutionizes blockchain via multi-chain unity for scalability,Parachains innovate, Relay Chain secures, governance empowers."
                  />
                  <ItemContainer
                    imageSrc="https://www.parity.io/images/image1-1.png"
                    name="Ink! Smart Contracts"
                    description="Ink: Polkadot's smart contract language, enabling secure and efficient decentralized apps with formal verification and seamless integration."
                  />
                  <ItemContainer
                    imageSrc="https://alephzero.org/blog/app/uploads/2023/01/aleph-zero-testnet-update-ink-smart-contracts.jpeg"
                    name="Aleph Zero Testnet"
                    description="Aleph Zero is a high-speed, secure, and scalable public blockchain. It uses a DAG-based consensus and custom Substrate modules for efficiency. It's peer-reviewed and backed by academic support."
                  />
                </div>
              </footer>
            </>
          );
        }}
      </Formik>
    </div>
  );
};
