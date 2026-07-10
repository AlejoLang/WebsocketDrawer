type UserContext = {
  name: string;
  id: number;
} | null;

type AuthContextValue = {
  user: UserContext;
  loading: boolean;
  refetch: () => void;
};

export type { UserContext, AuthContextValue };

