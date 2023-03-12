import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { noisConfig } from "@/lib/noisConfig";
import { useState } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { FaCheck, FaPlus } from "react-icons/fa";

export default function Home() {
  const [lastError, setLastError] = useState<{ title: string; description: string }>();
  const [installed, setInstalled] = useState(false);
  const toast = useToast();

  function addNoisAsSuggestedChain() {
    setLastError(undefined);
    const anyWindow: any = window;
    if (!anyWindow.keplr) {
      setLastError({
        title: "Keplr not found",
        description: "It seems like Keplr is not installed.",
      });
    } else {
      anyWindow.keplr.experimentalSuggestChain(noisConfig).then(
        () => {
          console.log("Suggested chain installed");
          setInstalled(true);
          toast({
            title: "Installed.",
            description: "Nois Testnet installed in Keplr.",
            status: "success",
            duration: 3_000,
            isClosable: true,
          });
        },
        (err: any) => {
          console.error(err);
          setLastError({
            title: "Suggested chain could not be added",
            description: err.toString(),
          });
        },
      );
    }
  }

  return (
    <>
      <Head>
        <title>Nois Address Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <VStack>
          <p>
            <Button
              leftIcon={installed ? <FaCheck /> : <FaPlus />}
              isDisabled={installed}
              colorScheme="blue"
              variant="solid"
              onClick={() => addNoisAsSuggestedChain()}
            >
              {installed ? <>Added</> : <>Add Nois Testnet to Keplr</>}
            </Button>
          </p>

          {lastError && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle>{lastError.title}</AlertTitle>
              <AlertDescription>{lastError.description}</AlertDescription>
            </Alert>
          )}
        </VStack>
      </main>
    </>
  );
}
