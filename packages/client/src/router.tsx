import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { GuestLayout } from "@/layouts/GuestLayout";
import { OwnerLayout } from "@/layouts/OwnerLayout";
import { GuestMenuSkeleton } from "@/components/skeletons/GuestMenuSkeleton";
import { GuestRouteSkeleton } from "@/components/skeletons/GuestRouteSkeleton";
import { OwnerRouteSkeleton } from "@/components/skeletons/OwnerRouteSkeleton";
import { OwnerDashboardSkeleton } from "@/components/skeletons/OwnerDashboardSkeleton";
import { ItemEditorSkeleton } from "@/components/skeletons/ItemEditorSkeleton";
import { CsvImportLayout } from "@/pages/owner/csv/CsvImportLayout";
import MenuLegacyRedirect from "@/pages/owner/MenuLegacyRedirect";

const GuestMenuPage = lazy(() => import("@/pages/guest/GuestMenuPage"));
const GuestFiltersPage = lazy(() => import("@/pages/guest/GuestFiltersPage"));
const OrderPage = lazy(() => import("@/pages/guest/OrderPage"));

const OwnerDashboardPage = lazy(() => import("@/pages/owner/OwnerDashboardPage"));
const CategoryPage = lazy(() => import("@/pages/owner/CategoryPage"));
const ItemEditPage = lazy(() => import("@/pages/owner/ItemEditPage"));
const NewMenuItemPage = lazy(() => import("@/pages/owner/NewMenuItemPage"));

const CsvStep1Page = lazy(() => import("@/pages/owner/csv/CsvStep1Page"));
const CsvStep2Page = lazy(() => import("@/pages/owner/csv/CsvStep2Page"));
const CsvStep3Page = lazy(() => import("@/pages/owner/csv/CsvStep3Page"));

const ScanStep1Page = lazy(() => import("@/pages/owner/scan/ScanStep1Page"));
const ScanStep2Page = lazy(() => import("@/pages/owner/scan/ScanStep2Page"));
const ScanStep3Page = lazy(() => import("@/pages/owner/scan/ScanStep3Page"));

/** Old `/owner/...` bookmarks → same path without `/owner` prefix. */
function LegacyOwnerRedirect() {
  const { pathname, search, hash } = useLocation();
  const to = pathname.replace(/^\/owner(?=\/|$)/, "") || "/";
  return <Navigate to={`${to}${search}${hash}`} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <OwnerLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<OwnerDashboardSkeleton />}>
            <OwnerDashboardPage />
          </Suspense>
        ),
      },
      {
        path: "menus/:menuId/category/:categoryId",
        element: (
          <Suspense fallback={<OwnerRouteSkeleton />}>
            <CategoryPage />
          </Suspense>
        ),
      },
      {
        path: "menus/:menuId",
        element: <MenuLegacyRedirect />,
      },
      {
        path: "items/new",
        element: (
          <Suspense fallback={<ItemEditorSkeleton />}>
            <NewMenuItemPage />
          </Suspense>
        ),
      },
      {
        path: "items/:itemId/edit",
        element: (
          <Suspense fallback={<ItemEditorSkeleton />}>
            <ItemEditPage />
          </Suspense>
        ),
      },
      {
        path: "import/csv",
        element: <CsvImportLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<OwnerRouteSkeleton />}>
                <CsvStep1Page />
              </Suspense>
            ),
          },
          {
            path: "map",
            element: (
              <Suspense fallback={<OwnerRouteSkeleton />}>
                <CsvStep2Page />
              </Suspense>
            ),
          },
          {
            path: "review",
            element: (
              <Suspense fallback={<OwnerRouteSkeleton />}>
                <CsvStep3Page />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "import/scan",
        element: <Outlet />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<OwnerRouteSkeleton />}>
                <ScanStep1Page />
              </Suspense>
            ),
          },
          {
            path: "progress",
            element: (
              <Suspense fallback={<OwnerRouteSkeleton />}>
                <ScanStep2Page />
              </Suspense>
            ),
          },
          {
            path: "review",
            element: (
              <Suspense fallback={<OwnerRouteSkeleton />}>
                <ScanStep3Page />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/menu/:menuId",
    element: <GuestLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<GuestMenuSkeleton />}>
            <GuestMenuPage />
          </Suspense>
        ),
      },
      {
        path: "filters",
        element: (
          <Suspense fallback={<GuestRouteSkeleton />}>
            <GuestFiltersPage />
          </Suspense>
        ),
      },
      {
        path: "order",
        element: (
          <Suspense fallback={<GuestRouteSkeleton />}>
            <OrderPage />
          </Suspense>
        ),
      },
    ],
  },
  { path: "/owner/*", element: <LegacyOwnerRedirect /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
