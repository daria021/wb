import React, {lazy, Suspense, useEffect} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

import {DeepLinkRouter} from "./components/DeepLinkRouter";
import {UserProvider} from './contexts/user';
import {expandViewport, init, mountViewport} from '@telegram-apps/sdk';
import ReactDOM from 'react-dom';
import {AuthProvider} from "./contexts/auth";
import BackButtonManager from "./components/BackButtonManager";

const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const SellerCabinet = lazy(() => import('./pages/SellerCabinet'));
const MyProductsPage = lazy(() => import('./pages/MyProductsPage'));
const CreateProductForm = lazy(() => import('./pages/CreateProductForm'));
const CreateProductInfo = lazy(() => import('./pages/CreateProductInfo'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const InstructionPage = lazy(() => import('./pages/order_flow/InstructionPage'));
const CartScreenshotPage = lazy(() => import('./pages/order_flow/CartScreenshotPage'));
const ProductFindPage = lazy(() => import('./pages/order_flow/ProductFindPage'));
const ProductFavoritePage = lazy(() => import('./pages/order_flow/ProductFavoritePage'));
const PaymentDetailsPage = lazy(() => import('./pages/order_flow/PaymentDetailsPage'));
const StepOrderPlacement = lazy(() => import('./pages/order_flow/StepOrderPlacement'));
const ProductPickupPage = lazy(() => import('./pages/order_flow/ProductPickupPage'));
const StepReviewReportPage = lazy(() => import('./pages/order_flow/StepReviewReportPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const FinalDealPage = lazy(() => import('./pages/order_flow/FinalDealPage'));
const SellerReportsPage = lazy(() => import('./pages/SellerReportsPage'));
const OrderReportPage = lazy(() => import('./pages/OrderReportPage'));
const SellerBalancePage = lazy(() => import('./pages/SellerBalance'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CompleteInstructionPage = lazy(() => import('./pages/CompleteInstructionPage'));
const RequirementsPage = lazy(() => import('./pages/RequirementsPage'));
const QuestionPage = lazy(() => import('./pages/QuestionPage'));
const InviteFriendsPage = lazy(() => import('./pages/InviteFriendsPage'));
const BlacklistPage = lazy(() => import( "./pages/BlacklistPage"));
const ModeratorOrdersPage = lazy(() => import( "./pages/moderator/ModeratorOrdersPage.jsx"));

// Moderator pages
const ModeratorDashboard = lazy(() => import('./pages/moderator/ModeratorDashboard'));
const ModeratorProductsPage = lazy(() => import('./pages/moderator/ModeratorProductsPage'));
const ModeratorProductReviewPage = lazy(() => import('./pages/moderator/ModeratorProductReviewPage'));
const ModeratorUsersPage = lazy(() => import('./pages/moderator/ModeratorUserPage'));
const ModeratorUserDetailPage = lazy(() => import('./pages/moderator/ModeratorUserDetailPage'));
const PushFormPage = lazy(() => import('./pages/moderator/PushFormPage'));
const PushAdminPage = lazy(() => import('./pages/moderator/PushAdminPage'));
const PushDetailsPage = lazy(() => import('./pages/moderator/PushDetailsPage'));


interface VideoOverlayProps {
    children: React.ReactNode;
    onClose: () => void;
}

export function VideoOverlay({children, onClose}: VideoOverlayProps) {
    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-80"
            onClick={onClose}
        >
            {children}
        </div>,
        document.body
    );
}


function App() {
    useEffect(() => {
        // 1) Локальная консоль ошибок
  if (process.env.NODE_ENV !== 'production') {
    import('eruda').then(m => m.default.init());
  }
        // 2) Инициализируем Telegram Mini App SDK
        init();

        // 3) Монтируем viewport (запрашиваем у Telegram параметры вьюпорта)
        if (mountViewport.isAvailable()) {
            mountViewport()
                .then(() => {
                    // 4) После успешного монтирования расширяем WebApp
                    if (expandViewport.isAvailable()) {
                        expandViewport();
                    }
                })
                .catch(console.error);
        }
    }, []);

    return (
        <UserProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin" />
              </div>
            }
          >
            <DeepLinkRouter />
            <BackButtonManager />
            <Routes>
                                    <Route path="/" element={<HomePage/>}/>
                                    <Route path="/invite" element={<InviteFriendsPage/>}/>
                                    <Route path="/about" element={<AboutPage/>}/>
                                    <Route path="/instruction" element={<CompleteInstructionPage/>}/>
                                    <Route path="/requirements" element={<RequirementsPage/>}/>
                                    <Route path="/question" element={<QuestionPage/>}/>
                                    <Route path="/catalog" element={<CatalogPage/>}/>
                                    <Route path="/product/:productId" element={<ProductDetailPage/>}/>
                                    <Route path="/product/:productId/instruction" element={<InstructionPage/>}/>
                                    <Route path="/product/:orderId/step-1" element={<CartScreenshotPage/>}/>
                                    <Route path="/order/:orderId/step-2" element={<ProductFindPage/>}/>
                                    <Route path="/order/:orderId/step-3" element={<ProductFavoritePage/>}/>
                                    <Route path="/order/:orderId/step-4" element={<PaymentDetailsPage/>}/>
                                    <Route path="/order/:orderId/step-5" element={<StepOrderPlacement/>}/>
                                    <Route path="/order/:orderId/step-6" element={<ProductPickupPage/>}/>
                                    <Route path="/order/:orderId/step-7" element={<StepReviewReportPage/>}/>
                                    <Route path="/order/:orderId/order-info" element={<FinalDealPage/>}/>
                                    <Route path="/black-list/:sellerNickname" element={<BlacklistPage/>}/>

                                    <Route path="/seller-cabinet" element={<SellerCabinet/>}/>
                                    <Route path="/seller-cabinet/reports" element={<SellerReportsPage/>}/>
                                    <Route path="/seller-cabinet/reports/:orderId" element={<OrderReportPage/>}/>
                                    <Route path="/seller-cabinet/balance" element={<SellerBalancePage/>}/>
                                    <Route path="/my-products" element={<MyProductsPage/>}/>
                                    <Route path="/create-product/:productId?" element={<CreateProductForm/>}/>
                                    <Route path="/product/:productId/seller" element={<CreateProductInfo/>}/>
                                    <Route path="/user/orders" element={<MyOrdersPage/>}/>

                                    <Route path="/moderator" element={<ModeratorDashboard/>}/>
                                    <Route path="/moderator/users" element={<ModeratorUsersPage/>}/>
                                    <Route path="/moderator/products" element={<ModeratorProductsPage/>}/>
                                    <Route path="/moderator/products/:productId"
                                           element={<ModeratorProductReviewPage/>}/>
                                    <Route path="/" element={<HomePage/>}/>
                                    <Route path="/moderator" element={<ModeratorDashboard/>}/>
                                    <Route path="/moderator/users" element={<ModeratorUsersPage/>}/>
                                    <Route path="/moderator/users/:userId" element={<ModeratorUserDetailPage/>}/>
                                    <Route path="/moderator/products" element={<ModeratorProductsPage/>}/>
                                    <Route path="/moderator/products/:productId"
                                           element={<ModeratorProductReviewPage/>}/>

                                    <Route path="/moderator/pushes" element={<PushAdminPage/>}/>
                                    <Route path="/moderator/pushes/new" element={<PushFormPage/>}/>
                                    <Route path="/moderator/pushes/:pushId" element={<PushDetailsPage/>}/>
                                    <Route path="/moderator/pushes/:pushId/edit" element={<PushFormPage/>}/>
                                    <Route path="/moderator/orders" element={<ModeratorOrdersPage/>}/>
                                    {/*<Route path="/moderator/orders/:orderId" element={<ModeratorOrderDetailPage/>}/>*/}
                                </Routes>
                            </Suspense>
                        </BrowserRouter>
                        </AuthProvider>

                        </UserProvider>

                        );
                    }


                        export default App;
