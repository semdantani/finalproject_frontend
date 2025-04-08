import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./context/user.context";
import ErrorBoundary from "./component/ErrorBoundary";

function App() {
  return (
    <UserProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </UserProvider>
  );
}

export default App;
