import Head from "next/head";
import { addressPrefix, noisMainnet, noisTestnet } from "@/lib/noisConfig";
import { useState } from "react";
import {
  Button,
  VStack,
  useToast,
  Text,
  Heading,
  SimpleGrid,
  Box,
  Container,
  Link,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { FaCheck, FaCheckDouble, FaPlus, FaUserSecret, FaUserShield } from "react-icons/fa";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import { ErrorAlert, ErrorData } from "@/lib/ErrorAlert";

function capitalizeFirstLetter(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Home() {
  const [lastAddChainError, setAddChainError] = useState<ErrorData>();
  const [loadAddressError, setLoadAddressError] = useState<ErrorData>();
  const [loadAddressFromLedgerError, setLoadAddressFromLedgerError] = useState<ErrorData>();
  const [showAddressFromLedgerError, setShowAddressFromLedgerError] = useState<ErrorData>();
  const [testnetInstalled, setTestnetInstalled] = useState<boolean>();
  const [mainnetInstalled, setMainnetInstalled] = useState<boolean>();
  const [enableShowOnLedger, setEnableShowOnLedger] = useState<boolean>(false);
  const [address, setAddress] = useState<string>();
  const toast = useToast();

  function resetErrors() {
    toast.closeAll();
    setAddChainError(undefined);
    setLoadAddressError(undefined);
    setLoadAddressFromLedgerError(undefined);
    setShowAddressFromLedgerError(undefined);
  }

  function addNoisAsSuggestedChain(network: "testnet" | "mainnet") {
    resetErrors();

    const config = network === "testnet" ? noisTestnet : noisMainnet;

    const anyWindow: any = window;
    if (!anyWindow.keplr) {
      setAddChainError({
        title: "Keplr not found",
        description: "It seems like Keplr is not installed.",
      });
    } else {
      anyWindow.keplr.experimentalSuggestChain(config).then(
        () => {
          console.log("Suggested chain installed");
          if (network === "testnet") {
            setTestnetInstalled(true);
          } else {
            setMainnetInstalled(true);
          }
          toast({
            title: "Installed",
            description: `Nois ${capitalizeFirstLetter(network)} installed in Keplr.`,
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

  function loadAddressFromKeplr(network: "testnet" | "mainnet") {
    resetErrors();
    setAddress(undefined);

    const config = network === "testnet" ? noisTestnet : noisMainnet;

    const anyWindow: any = window;
    if (!anyWindow.keplr) {
      setLoadAddressError({
        title: "Keplr not found",
        description: "It seems like Keplr is not installed.",
      });
    } else {
      const keplr = anyWindow.keplr;
      keplr.enable(config.chainId).then(
        () => {
          console.log("Chain enabled");

          const offlineSigner = keplr.getOfflineSigner(config.chainId);
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
      const accounts = await offlineSigner.getAccounts();
      console.log(accounts);
      const address = accounts[0].address;
      if (typeof address !== "string") throw new Error("First account must have a string address");
      setAddress(address);
      toast({
        title: "Loaded",
        description: "Got account address from Ledger.",
        status: "success",
        duration: 2_000,
        isClosable: true,
      });
      setEnableShowOnLedger(true);
    })().catch((err: any) => {
      console.error(err);
      setLoadAddressFromLedgerError({
        title: "Ledger error",
        description: err.message ?? err.toString(),
      });
    });
  }

  function showAddressFromLedger() {
    resetErrors();

    (async () => {
      // Prepare ledger
      const ledgerTransport = await TransportWebUSB.create(120000, 120000);

      // Setup signer
      const offlineSigner = new LedgerSigner(ledgerTransport, {
        prefix: addressPrefix,
      });
      await offlineSigner.showAddress();
    })().catch((err: any) => {
      if (err.toString().match(/rejected by the user/i)) {
        console.info(err); // this case is fine
      } else {
        console.error(err);
        setShowAddressFromLedgerError({
          title: "Ledger error",
          description: err.message ?? err.toString(),
        });
      }
    });
  }

  function resetAll() {
    resetErrors();
    setAddress(undefined);
    setEnableShowOnLedger(false);
  }

  return (
    <>
      <Head>
        <title>Nois Address Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxW="800px" marginTop="40px">
        <SimpleGrid minChildWidth="300px" spacing="40px">
          <Box>
            <VStack spacing={4} align="flex-start">
              <Heading>Keplr Extension</Heading>
              <Heading size="sm">Step 1</Heading>
              <Text>
                Install the{" "}
                <Link href="https://www.keplr.app/download" isExternal>
                  Keplr browser extension
                </Link>{" "}
                and follow the instructions to create an account.
              </Text>
              <Heading size="sm">Step 2</Heading>
              <Text>
                <Button
                  leftIcon={testnetInstalled ? <FaCheck /> : <FaPlus />}
                  isDisabled={testnetInstalled}
                  colorScheme="blue"
                  variant="solid"
                  size="sm"
                  onClick={() => addNoisAsSuggestedChain("testnet")}
                >
                  {testnetInstalled ? <>Added</> : <>Add Nois Testnet to Keplr</>}
                </Button>{" "}
                or
              </Text>
              <Button
                leftIcon={mainnetInstalled ? <FaCheck /> : <FaPlus />}
                isDisabled={mainnetInstalled}
                colorScheme="blue"
                variant="solid"
                size="sm"
                onClick={() => addNoisAsSuggestedChain("mainnet")}
              >
                {mainnetInstalled ? <>Added</> : <>Add Nois Mainnet to Keplr</>}
              </Button>
              {lastAddChainError && <ErrorAlert error={lastAddChainError} />}
              <Heading size="sm">Step 3</Heading>
              <Text>Ensure you selected to right account in Keplr. Then:</Text>
              <Text>
                <Button
                  leftIcon={<FaUserShield />}
                  colorScheme="blue"
                  variant="solid"
                  size="sm"
                  onClick={() => loadAddressFromKeplr("testnet")}
                >
                  Load address (Testnet)
                </Button>{" "}
                or
              </Text>
              <Button
                leftIcon={<FaUserShield />}
                colorScheme="blue"
                variant="solid"
                size="sm"
                onClick={() => loadAddressFromKeplr("mainnet")}
              >
                Load address (Mainnet)
              </Button>
              {loadAddressError && <ErrorAlert error={loadAddressError} />}
            </VStack>
          </Box>
          <Box>
            <VStack spacing={4} align="flex-start">
              <Heading>Ledger via WebUSB</Heading>

              <Heading size="sm">Step 1</Heading>
              <Text>Install and open Cosmos app on Ledger Nano S or Nano X.</Text>

              <Heading size="sm">Step 2</Heading>

              <Button
                leftIcon={<FaUserSecret />}
                colorScheme="blue"
                variant="solid"
                size="sm"
                onClick={() => loadAddressFromLedger()}
              >
                Load address from Ledger
              </Button>

              {loadAddressFromLedgerError && <ErrorAlert error={loadAddressFromLedgerError} />}

              <Heading size="sm">Step 3</Heading>
              <Text>Check address on Ledger device:</Text>
              <Button
                isDisabled={!enableShowOnLedger}
                leftIcon={<FaCheckDouble />}
                colorScheme="blue"
                variant="solid"
                size="sm"
                onClick={() => showAddressFromLedger()}
              >
                Show address on Ledger
              </Button>

              {showAddressFromLedgerError && <ErrorAlert error={showAddressFromLedgerError} />}
            </VStack>
          </Box>
        </SimpleGrid>

        {address && (
          <Text marginTop="100px" fontSize="2xl" align="center">
            {address}{" "}
            <Button size="sm" onClick={() => resetAll()} title="Reset">
              <CloseIcon />
            </Button>
          </Text>
        )}
      </Container>
    </>
  );
}
