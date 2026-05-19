import { Alert } from './ui/alert.jsx';

export const ErrorMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  return <Alert variant="destructive">{message}</Alert>;
};
