import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Dashboard from "./components/Dashboard";
import AssetList from "./components/AssetList";
import AssetDetail from "./components/AssetDetail";
import AddAsset from "./components/AddAsset";
import Reports from "./components/Reports";
import NotFound from "./components/NotFound";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "assets", Component: AssetList },
      { path: "assets/:id", Component: AssetDetail },
      { path: "add-asset", Component: AddAsset },
      { path: "reports", Component: Reports },
      { path: "profile", Component: UserProfile },
      { path: "*", Component: NotFound },
    ],
  },
]);