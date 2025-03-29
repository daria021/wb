// src/App.tsx
import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import SellerCabinet from "./pages/SellerCabinet";
import MyProductsPage from "./pages/MyProductsPage";
import CreateProductForm from "./pages/CreateProductForm";
import CreateProductInfo from "./pages/CreateProductInfo";
import {AuthProvider} from "./contexts/auth";
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

function App() {
    window.Telegram.WebApp.expand();
    eruda.init();

    window.onerror = (message, source, lineno, colno, error) => {
        if (typeof message === "string" && message.includes("window.TelegramGameProxy.receiveEvent")) {
            // Return true to indicate that the error has been handled
            return true;
        }
        console.log(typeof message, typeof message === "string");
        // Otherwise, let the error propagate
        return false;
    };

    return (
        <AuthProvider>
            <BrowserRouter>
                <BackButtonManager/>
                <Routes>
                    {/* Главная страница */}
                    <Route path="/" element={<HomePage/>}/>
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

                    <Route path="/seller-cabinet" element={<SellerCabinet/>}/>
                    <Route path="/seller-cabinet/reports" element={<SellerReportsPage/>}/>
                    <Route path="/seller-cabinet/reports/:orderId" element={<OrderReportPage/>}/>
                    <Route path="/seller-cabinet/balance" element={<SellerBalancePage/>}/>

                    <Route path="/my-products" element={<MyProductsPage/>}/>
                    <Route path="/create-product/:productId?" element={<CreateProductForm/>}/>
                    <Route path="/product/:productId/seller" element={<CreateProductInfo/>}/>
                    <Route path="/user/orders" element={<MyOrdersPage/>}/>

                    <Route path="/" element={<HomePage />} />
                    <Route path="/moderator" element={<ModeratorDashboard />} />
                    <Route path="/moderator/users" element={<ModeratorUsersPage />} />
                    <Route path="/moderator/products" element={<ModeratorProductsPage />} />
                    <Route path="/moderator/products/:productId" element={<ModeratorProductReviewPage />} />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
