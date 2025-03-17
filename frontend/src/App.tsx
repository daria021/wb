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
import ProductDetailPage from "./pages/ProductDetailPage";
import InstructionPage from "./pages/InstructionPage";
import CartScreenshotPage from "./pages/CartScreenshotPage";

function App() {
    window.Telegram.WebApp.expand();
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Главная страница */}
                    <Route path="/" element={<HomePage/>}/>

                    {/* Каталог товаров */}
                    <Route path="/catalog" element={<CatalogPage/>}/>
                    <Route path="/product/:productId" element={<ProductDetailPage/>}/>
                    <Route path="/product/:productId/instruction" element={<InstructionPage/>} />
                    <Route path="/product/:productId/step-1" element={<CartScreenshotPage/>} />
                    <Route path="/seller-cabinet" element={<SellerCabinet/>}/>
                    <Route path="/my-products" element={<MyProductsPage/>}/>
                    <Route path="/create-product/:productId?" element={<CreateProductForm/>}/>
                    <Route path="/product:productId" element={<CreateProductInfo/>}/>
                    <Route path="/user/orders" element={<MyOrdersPage/>}/>


                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
