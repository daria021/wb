import React, {useEffect} from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import SellerCabinet from "./pages/SellerCabinet";
import MyProductsPage from "./pages/MyProductsPage";
import CreateProductForm from "./pages/CreateProductForm";
import CreateProductInfo from "./pages/CreateProductInfo";
import { AuthProvider } from "./contexts/auth";
import MyOrdersPage from "./pages/MyOrdersPage";
import InstructionPage from "./pages/order_flow/InstructionPage";
import CartScreenshotPage from "./pages/order_flow/CartScreenshotPage";
import ProductFindPage from "./pages/order_flow/ProductFindPage";
import ProductFavoritePage from "./pages/order_flow/ProductFavoritePage";
import PaymentDetailsPage from "./pages/order_flow/PaymentDetailsPage";
import StepOrderPlacement from "./pages/order_flow/StepOrderPlacement";
import ProductPickupPage from "./pages/order_flow/ProductPickupPage";
import StepReviewReportPage from "./pages/order_flow/StepReviewReportPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import FinalDealPage from "./pages/order_flow/FinalDealPage";
import BackButtonManager from "./components/BackButtonManager";
import SellerReportsPage from "./pages/SellerReportsPage";
import OrderReportPage from "./pages/OrderReportPage";
import eruda from 'eruda';
import SellerBalancePage from "./pages/SellerBalance";
import AboutPage from "./pages/AboutPage";
import CompleteInstructionPage from "./pages/CompleteInstructionPage";
import RequirementsPage from "./pages/RequirementsPage";
import QuestionPage from "./pages/QuestionPage";
import ModeratorDashboard from "./pages/moderator/ModeratorDashboard";
import ModeratorProductsPage from "./pages/moderator/ModeratorProductsPage";
import ModeratorProductReviewPage from "./pages/moderator/ModeratorProductReviewPage";
import ModeratorUsersPage from "./pages/moderator/ModeratorUserPage";
import PushFormPage from "./pages/moderator/PushFormPage";
import InviteFriendsPage from "./pages/InviteFriendsPage";
import ModeratorUserDetailPage from "./pages/moderator/ModeratorUserDetailPage";
import PushAdminPage from "./pages/moderator/PushAdminPage";
import PushDetailsPage from "./pages/moderator/PushDetailsPage";


import { init, mountViewport, expandViewport } from '@telegram-apps/sdk';
import BlacklistPage from "./pages/BlacklistPage";


function App() {
    useEffect(() => {
        // 1) Локальная консоль ошибок
        eruda.init();

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
        <AuthProvider>
            <BrowserRouter>
                <BackButtonManager/>
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
                    <Route path="/product/:productId/step-1" element={<CartScreenshotPage/>}/>
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
                    <Route path="/moderator/products/:productId" element={<ModeratorProductReviewPage/>}/>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/moderator" element={<ModeratorDashboard />} />
                    <Route path="/moderator/users" element={<ModeratorUsersPage />} />
                    <Route path="/moderator/users/:userId" element={<ModeratorUserDetailPage />} />
                    <Route path="/moderator/products" element={<ModeratorProductsPage />} />
                    <Route path="/moderator/products/:productId" element={<ModeratorProductReviewPage />} />

                    <Route path="/moderator/pushes" element={<PushAdminPage/>}/>
                    <Route path="/moderator/pushes/new" element={<PushFormPage/>}/>
                    <Route path="/moderator/pushes/:pushId" element={<PushDetailsPage/>}/>
                    <Route path="/moderator/pushes/:pushId/edit" element={<PushFormPage/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
