import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { addressPrefix, chainId, noisConfig } from "@/lib/noisConfig";
import { useState } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  useToast,
  Text,
  Divider,
  Heading,
} from "@chakra-ui/react";
import { FaCheck, FaPlus, FaUser } from "react-icons/fa";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { LedgerSigner } from "@cosmjs/ledger-amino";

export default function Home() {
  const [lastAddChainError, setAddChainError] = useState<{ title: string; description: string }>();
  const [loadAddressError, setLoadAddressError] = useState<{
    title: string;
    description: string;
  }>();
  const [loadAddressFromLedgerError, setAddressFromLedgerError] = useState<{
    title: string;
    description: string;
  }>();
  const [installed, setInstalled] = useState<boolean>();
  const [address, setAddress] = useState<string>();
  const toast = useToast();

  function resetErrors() {
    toast.closeAll();
    setAddChainError(undefined);
    setLoadAddressError(undefined);
    setAddressFromLedgerError(undefined);
  }

  function addNoisAsSuggestedChain() {
    resetErrors();

    const anyWindow: any = window;
    if (!anyWindow.keplr) {
      setAddChainError({
        title: "Keplr not found",
        description: "It seems like Keplr is not installed.",
      });
    } else {
      anyWindow.keplr.experimentalSuggestChain(noisConfig).then(
        () => {
          console.log("Suggested chain installed");
          setInstalled(true);
          toast({
            title: "Installed",
            description: "Nois Testnet installed in Keplr.",
            status: "success",
            duration: 2_000,
            isClosable: true,
          });
        },
        (err: any) => {
          console.error(err);
          setAddChainError({
            title: "Suggested chain could not be added",
            description: err.toString(),
          });
        },
      );
    }
  }

  function loadAddressFromKeplr() {
    resetErrors();
    setAddress(undefined);

    const anyWindow: any = window;
    if (!anyWindow.keplr) {
      setLoadAddressError({
        title: "Keplr not found",
        description: "It seems like Keplr is not installed.",
      });
    } else {
      const keplr = anyWindow.keplr;
      keplr.enable(chainId).then(
        () => {
          console.log("Chain enabled");

          const offlineSigner = keplr.getOfflineSigner(chainId);
          offlineSigner.getAccounts().then(
            (accounts: any) => {
              console.log("Accounts:", accounts);
              const address = accounts[0].address;
              if (typeof address !== "string")
                throw new Error("First account must have a string address");
              setAddress(address);
              toast({
                title: "Loaded",
                description: "Got account address from Keplr.",
                status: "success",
                duration: 2_000,
                isClosable: true,
              });
            },
            (err: any) => {
              console.error(err);
              setLoadAddressError({
                title: "Account unavailable",
                description: "Could not get account from Keplr.",
              });
            },
          );
        },
        (err: any) => {
          console.error(err);
          setLoadAddressError({
            title: "Keplr unavailable",
            description: "Could not enable Keplr with the given chain ID.",
          });
        },
      );
    }
  }

  function loadAddressFromLedger() {
    resetErrors();
    setAddress(undefined);

    (async () => {
      // Prepare ledger
      const ledgerTransport = await TransportWebUSB.create(120000, 120000);

      // Setup signer
      const offlineSigner = new LedgerSigner(ledgerTransport, {
        prefix: addressPrefix,
      });
      console.log(offlineSigner);
      const accounts = await offlineSigner.getAccounts();
      console.log(accounts);
      const address = accounts[0].address;
      if (typeof address !== "string") throw new Error("First account must have a string address");
      setAddress(address);
    })().catch((err: any) => {
      console.error(err);
      setAddressFromLedgerError({
        title: "Ledger error",
        description: err.message ?? err.toString(),
      });
    });
  }

  return (
    <>
      <Head>
        <title>Nois Address Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <VStack spacing={10}>
          <Heading>Step 1</Heading>
          <Button
            leftIcon={installed ? <FaCheck /> : <FaPlus />}
            isDisabled={installed}
            colorScheme="blue"
            variant="solid"
            onClick={() => addNoisAsSuggestedChain()}
          >
            {installed ? <>Added</> : <>Add Nois Testnet to Keplr</>}
          </Button>

          {lastAddChainError && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>{lastAddChainError.title}</AlertTitle>
              <AlertDescription>{lastAddChainError.description}</AlertDescription>
            </Alert>
          )}

          <Heading>Step 2</Heading>

          <Button
            leftIcon={<FaUser />}
            colorScheme="blue"
            variant="solid"
            onClick={() => loadAddressFromKeplr()}
          >
            Load Address
          </Button>

          {loadAddressError && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>{loadAddressError.title}</AlertTitle>
              <AlertDescription>{loadAddressError.description}</AlertDescription>
            </Alert>
          )}

          {address && <Text size="lg">{address}</Text>}

          <Heading>Ledger</Heading>

          <Button
            leftIcon={<FaUser />}
            colorScheme="blue"
            variant="solid"
            onClick={() => loadAddressFromLedger()}
          >
            Load Address from Ledger
          </Button>

          {loadAddressFromLedgerError && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>{loadAddressFromLedgerError.title}</AlertTitle>
              <AlertDescription>{loadAddressFromLedgerError.description}</AlertDescription>
            </Alert>
          )}
        </VStack>
      </main>
    </>
  );
}
