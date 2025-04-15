import { createRoot } from "react-dom/client";

const app = document.getElementById("app");

const root = createRoot(app!);

const renderApp = () => {
  root.render(<p>Hello world</p>);
};
renderApp();
