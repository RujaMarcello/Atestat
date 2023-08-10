export type LoginFormState = {
  email: string;
  password: string;
};

export interface LoginPageInterface {
  requestedLocation?: string | null;
}

export interface LoginFormProps {
  loading?: boolean;
  onSubmit?: (formState: LoginFormState) => void;
  isSuccessfully: boolean | null;
  resetState: any;
}
