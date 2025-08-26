import { useEffect } from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { on, postEvent } from '@telegram-apps/sdk';
import {updateOrderStatus} from "../services/api";

export default function BackButtonManager() {
  const navigate = useNavigate();
  const { pathname, state } = useLocation();

  useEffect(() => {
    postEvent('web_app_setup_back_button', {
      is_visible: pathname !== '/',
    });
  }, [pathname]);

  useEffect(() => {
    const unsub = on('back_button_pressed', async () => {

      if (matchPath({ path: '/user/orders', end: true }, pathname)) {
        return navigate('/', { replace: true });
      }

      // SellerReportsPage  "/seller-cabinet/reports"  → в кабинет
      if (matchPath({ path: '/seller-cabinet/reports', end: true }, pathname)) {
        return navigate('/seller-cabinet', { replace: true });
      }

// отмена заказа только на шаге 1
const step1Match = matchPath(
  { path: '/product/:orderId/step-1', end: true },
  pathname
);

if (step1Match) {
  const { orderId } = step1Match.params as { orderId?: string };
  if (!orderId) return navigate('/catalog', { replace: true });

  if (!window.confirm('Вы уверены, что хотите отменить заказ?')) return;

  try {
    const formData = new FormData();
    formData.append('status', 'cancelled');
    updateOrderStatus(orderId, formData);
    alert('Заказ отменён');
  } catch (err) {
    console.error('Ошибка отмены заказа:', err);
    alert('Ошибка отмены заказа');
  }

  return navigate('/catalog', { replace: true });
}

      if (
        matchPath({ path: '/catalog', end: true }, pathname) &&
        state?.fromProductDetail
      ) {
        // простое «назад» вернёт на /product/:id
        return navigate(-1);
      }

      // CatalogPage "/catalog" и AboutPage "/about"
      if (
        matchPath({ path: '/catalog', end: true }, pathname) ||
        matchPath({ path: '/about', end: true }, pathname)
      ) {
        return navigate('/', { replace: true });
      }
      // ProductDetailPage "/product/:productId" → в каталог
      const productDetail = matchPath(
        { path: '/product/:productId', end: true },
        pathname
      );
      if (productDetail) {
        return navigate('/catalog', { replace: true });
      }

      // RequirementsPage "/requirements" и QuestionPage "/question" → в "/about"
      if (
        matchPath({ path: '/requirements', end: true }, pathname) ||
        matchPath({ path: '/question', end: true }, pathname)
      ) {
        return navigate('/about', { replace: true });
      }

      // ModeratorDashboard "/moderator"
      if (matchPath({ path: '/moderator', end: true }, pathname)) {
        return navigate('/', { replace: true });
      }
      // ModeratorUsersPage "/moderator/users" → дашборд
      if (matchPath({ path: '/moderator/users', end: true }, pathname)) {
        return navigate('/moderator', { replace: true });
      }
      // ModeratorUserDetailPage "/moderator/users/:userId" → список юзеров
      // const userDetail = matchPath(
      //   { path: '/moderator/users/:userId', end: true },
      //   pathname
      // );
      // if (userDetail) {
      //   return navigate('/moderator/users', { replace: true });
      // }
      // ModeratorProductsPage "/moderator/products" → дашборд
      if (matchPath({ path: '/moderator/products', end: true }, pathname)) {
        return navigate('/moderator', { replace: true });
      }
      // // ModeratorProductReviewPage "/moderator/products/:productId" → список продуктов
      // const modProd = matchPath(
      //   { path: '/moderator/products/:productId', end: true },
      //   pathname
      // );
      // if (modProd) {
      //   return navigate('/moderator/products', { replace: true });
      // }

      // PushAdminPage "/moderator/pushes" → дашборд модератора
      if (matchPath({ path: '/moderator/pushes', end: true }, pathname)) {
        return navigate('/moderator', { replace: true });
      }
      // PushFormPage в режиме “нового пуша” "/moderator/pushes/new" → список пушей
      if (matchPath({ path: '/moderator/pushes/new', end: true }, pathname)) {
        return navigate('/moderator/pushes', { replace: true });
      }
      // PushFormPage в режиме редактирования "/moderator/pushes/:pushId/edit"
      const editPush = matchPath(
        { path: '/moderator/pushes/:pushId/edit', end: true },
        pathname
      );
      if (editPush) {
        const { pushId } = editPush.params;
        return navigate(`/moderator/pushes/${pushId}`, { replace: true });
      }
      // PushDetailsPage "/moderator/pushes/:pushId" → список пушей
      const pushDetails = matchPath(
        { path: '/moderator/pushes/:pushId', end: true },
        pathname
      );
      if (pushDetails) {
        return navigate('/moderator/pushes', { replace: true });
      }
      const onCreateInfo = matchPath(
        { path: '/product/:productId/seller', end: true },
        pathname
      );
      if (onCreateInfo) {
        return navigate('/my-products', { replace: true });
      }

      // всё остальное — просто назад
      navigate(-1);
    });

    return unsub;
  }, [navigate, pathname]);

  return null;
}
