import "../styles/globals.css";
import { ThemeProvider } from "../stores/ThemeProvider";
import { AccessibilityProvider } from "../components/AccessibilityProvider";
import Pages from "./pages";

export default function App() {
  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <Pages />
      </AccessibilityProvider>
    </ThemeProvider>
  );
}