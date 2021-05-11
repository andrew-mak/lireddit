import React, { useRef } from "react";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from "@chakra-ui/react";

interface WarnAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  text?: {
    header?: string;
    description?: string;
    confirmButtonText?: string;
  };
}

const WarnAlertDialog: React.FC<WarnAlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  text,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {text?.header || "Delete"}
          </AlertDialogHeader>
          <AlertDialogBody>
            {text?.description ||
              "Are you sure? You can't undo this action afterwards."}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              {text?.confirmButtonText || "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default WarnAlertDialog;
