import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

interface LoginExpiredDialogProps {
  open: boolean;
  onConfirm: () => void;
}

export const LoginExpiredDialog: React.FC<LoginExpiredDialogProps> = ({
  open,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>登录状态已失效</AlertDialogTitle>
          <AlertDialogDescription>
            您的登录状态已失效，请重新登录！
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onConfirm}>确定</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
